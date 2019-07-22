var IS_CHROME = !!window.webkitRTCPeerConnection,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription;

if (IS_CHROME) {
  RTCPeerConnection = webkitRTCPeerConnection;
  RTCIceCandidate = window.RTCIceCandidate;
  RTCSessionDescription = window.RTCSessionDescription;
} else {
	if(typeof mozRTCPeerConnection !== "undefined") {
	  RTCPeerConnection = mozRTCPeerConnection;
	  RTCIceCandidate = mozRTCIceCandidate;
	  RTCSessionDescription = mozRTCSessionDescription;
	}
}
// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
var activedc;

/* HANDLE WEB PAGE*/
function showDialog(dialog) {
	var i, d, c, el, dialogs = ['createOrJoin','showLocalOffer','getRemoteOffer','showLocalAnswer','getRemoteAnswer','waitForConnection'], l = dialogs.length;
	for(i = 0; i < dialogs.length; i++) {
		d = dialogs[i];
		el = document.getElementById(d);
		if(dialog === d) {
			el.removeAttribute('hidden');
		} else {
			if(!el.hasAttribute('hidden')) {
				el.setAttribute('hidden', true);
			} else {
				c+=1;
			}
		}
	}
	//if all dialogs are being hidden start the game
	//only do it once so if all dialogs where already hidden do nothing
	if(dialog === '' && c !== l) {
		startGame();
	}
};

document.getElementById('createBtn').addEventListener("click", function() {
	if(cfg === undefined) { webRTCConfig(); }
    showDialog('showLocalOffer');
    previousPlayer = 1;
    remotePlayer = 0;
    remoteEnabled = 1;
    createLocalOffer();
});

document.getElementById('joinBtn').addEventListener("click", function() {
	if(cfg === undefined) { webRTCConfig(); }
    showDialog('getRemoteOffer');
    previousPlayer = 1;
    remotePlayer = 1;
    remoteEnabled = 0;
});

document.getElementById('offerSentBtn').addEventListener("click", function() {
    showDialog('getRemoteAnswer');
});

document.getElementById('offerRecdBtn').addEventListener("click", function() {
    var offer = document.getElementById('remoteOffer').value;
    var offerDesc = new RTCSessionDescription(JSON.parse(offer));
    handleOfferFromPC1(offerDesc);
    showDialog('showLocalAnswer');
});

document.getElementById('answerSentBtn').addEventListener("click", function() {
    showDialog('waitForConnection');
});

document.getElementById('answerRecdBtn').addEventListener("click", function() {
    var answer = document.getElementById('remoteAnswer').value;
    var answerDesc = new RTCSessionDescription(JSON.parse(answer));
    handleAnswerFromPC2(answerDesc);
    showDialog('waitForConnection');
});

function startGame() {
	WELCOME.HideMenu();
	GOBBLET.Start();
};
function checkConnection() {
	if(activedc === undefined) {
		document.getElementById('localAnswer').value = '';
		document.getElementById('remoteAnswer').value = '';
		document.getElementById('remoteOffer').value = '';
		document.getElementById('localOffer').value = '';
		showDialog('createOrJoin');
	} else {
		startGame();
	}
    return false;
};
function webRtcDoMove(pawn, tile) {
	activedc.send(JSON.stringify({pawn: pawn, tile: tile}));
	remoteEnabled = 0;
};

/* WEB RTC */
var cfg, con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };
/* THIS IS ALICE, THE CALLER/SENDER */
var pc1 = (typeof RTCPeerConnection === "undefined") ? {} : new RTCPeerConnection(cfg, con), dc1 = null, tn1 = null;

function webRTCConfig(value) {
	if(value === "LAN") {
		cfg = {'iceServers': []};
	} else {
		cfg = {'iceServers': [{'url':'stun:23.21.150.121'},
		      {'url': 'turn:192.158.29.39:3478?transport=udp','credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=','username': '28224511:1379330808'},
		      {'url': 'turn:192.158.29.39:3478?transport=tcp','credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=','username': '28224511:1379330808'}]};
	}
}

function setupDC1() {
    try {
        dc1 = pc1.createDataChannel('gobblet', {reliable:true});
        activedc = dc1;
        dc1.onopen = function (e) {
			showDialog('');
        }
        dc1.onmessage = function (e) {
            if (e.data.charCodeAt(0) == 2) {
			   // Firefox issue
			   return;
			}
			var data = JSON.parse(e.data);
			remotePawn = data.pawn;
			remoteTile = data.tile;
			remoteEnabled = 1;
        };
    } catch (e) { console.warn("No data channel (pc1)", e); }
}

function createLocalOffer() {
    setupDC1();
    pc1.createOffer(function (desc) {
        pc1.setLocalDescription(desc, function () {}, function () {});
    }, function () {console.warn("Couldn't create offer");});
}

pc1.onicecandidate = function (e) {
    if (e.candidate == null) {
        document.getElementById('localOffer').value = JSON.stringify(pc1.localDescription);
    }
};

//Firefox implementation
function handleOnconnection() {
	showDialog('');
}

pc1.onconnection = handleOnconnection;

function onsignalingstatechange(state) {
    console.info('signaling state change:', state);
}

function oniceconnectionstatechange(state) {
    console.info('ice connection state change:', state);
}

function onicegatheringstatechange(state) {
    console.info('ice gathering state change:', state);
}

pc1.onsignalingstatechange = onsignalingstatechange;
pc1.oniceconnectionstatechange = oniceconnectionstatechange;
pc1.onicegatheringstatechange = onicegatheringstatechange;

function handleAnswerFromPC2(answerDesc) {
    pc1.setRemoteDescription(answerDesc);
}

function handleCandidateFromPC2(iceCandidate) {
    pc1.addIceCandidate(iceCandidate);
}

/* THIS IS BOB, THE ANSWERER/RECEIVER */
var pc2 = (typeof RTCPeerConnection === "undefined") ? {} : new RTCPeerConnection(cfg, con), dc2 = null;

pc2.ondatachannel = function (e) {
    var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
    dc2 = datachannel;
    activedc = dc2;
    dc2.onopen = function (e) {
		showDialog('');
    }
    dc2.onmessage = function (e) {
        var data = JSON.parse(e.data);
        remotePawn = data.pawn;
        remoteTile = data.tile;
        remoteEnabled = 1;
    };
};

function handleOfferFromPC1(offerDesc) {
    pc2.setRemoteDescription(offerDesc);
    pc2.createAnswer(function (answerDesc) {
        pc2.setLocalDescription(answerDesc);
    }, function () { console.warn("No create answer"); });
}

pc2.onicecandidate = function (e) {
    if (e.candidate == null)
       document.getElementById('localAnswer').value = JSON.stringify(pc2.localDescription);
};

pc2.onsignalingstatechange = onsignalingstatechange;
pc2.oniceconnectionstatechange = oniceconnectionstatechange;
pc2.onicegatheringstatechange = onicegatheringstatechange;

function handleCandidateFromPC1(iceCandidate) {
    pc2.addIceCandidate(iceCandidate);
}

pc2.onaddstream = function (e) {
    var el = new Audio();
    el.autoplay = true;
    attachMediaStream(el, e.stream);
};

pc2.onconnection = handleOnconnection;
