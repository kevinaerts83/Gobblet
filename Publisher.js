var publisher = {
	on: function(type, fn, context) {
		type = type || 'any';
		fn = (typeof fn === 'function') ? fn : context[fn];
		if(this.subscribers[type] === undefined) {
			this.subscribers[type] = [];
		}
		this.subscribers[type].push({fn: fn, context: context || this});
	},
	remove: function(type, fn, context) {
		this.visitSubscribers('unsubscribe', type, fn, context);
	},
	fire: function(type, publication) {
		this.visitSubscribers('publish', type, publication);
	},
	visitSubscribers: function(action, type, arg, context) {
		var i, pubtype = type || 'any', subscribers = this.subscribers[pubtype], max = subscribers ? subscribers.length : 0;
		for(i=0; i < max; i+=1) {
			if(action == 'publish') {
				subscribers[i].fn.call(subscribers[i].context, arg);
			} else {
				if(subscribers[i].fn === arg && subscribers[i].context === context) {
					subscribers.splice(i, 1);
				}
			}
		}
	}
};

function makePublisher(o) {
	for(var i in publisher) {
		if(publisher.hasOwnProperty(i) && (typeof publisher[i] === 'function')) {
			o[i] = publisher[i];
		}
	}
	o.subscribers = {any: []};
}
