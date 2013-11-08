function Stars(id, opt) {
	this.name = 'konopas.' + id + '.stars';

	opt = opt || {};
	this.store = opt.store || localStorage;
	this.tag = opt.tag || 'has_star';

	this.server = false;
	this.data = this.read();
}

Stars.prototype.read = function() {
	return JSON.parse(this.store.getItem(this.name) || '{}');
}

Stars.prototype.write = function() {
	try {
		this.store.setItem(this.name, JSON.stringify(this.data));
	} catch (e) {
		if ((e.code != DOMException.QUOTA_EXCEEDED_ERR) || (this.store.length != 0)) { throw e; }
	}
}

Stars.prototype.list = function() {
	var list = [];
	if (this.data) for (var id in this.data) {
		if ((this.data[id].length == 2) && this.data[id][0]) list.push(id);
	}
	return list;
}

Stars.prototype.add = function(star_list, mtime) {
	mtime = mtime || Math.floor(Date.now()/1000);
	star_list.forEach(function(id) { this.data[id] = [1, mtime]; }, this);

	this.write();
	if (this.server) this.server.set_prog(this.list());
}

Stars.prototype.set = function(star_list) {
	var mtime = Math.floor(Date.now()/1000);
	if (this.data) for (var id in this.data) {
		this.data[id] = [0, mtime];
	}
	this.add(star_list, mtime);
}

Stars.prototype.toggle = function(el, id) {
	var add_star = !el.classList.contains(this.tag);
	var mtime = Math.floor(Date.now()/1000);

	this.data[id] = [add_star ? 1 : 0, mtime];
	this.write();
	if (this.server) this.server.add_prog(id, add_star);

	if (add_star) el.classList.add(this.tag);
	else          el.classList.remove(this.tag);
}

Stars.prototype.sync = function(new_data) {
	console.log("old data: " + JSON.stringify(this.data));
	console.log("new data: " + JSON.stringify(new_data));

	var mod = false;
	for (var id in new_data) {
		if (new_data[id].length != 2) {
			console.warn("Stars.sync: invalid input " + id + ": " + JSON.stringify(new_data[id]));
			continue;
		}
		if (!(id in this.data) || (new_data[id][1] > this.data[id][1])) {
			this.data[id] = new_data[id];
			mod = true;
		}
	}
	if (!mod) console.log("nothing changed");
	else init_view();
}
