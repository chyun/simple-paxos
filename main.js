var entity = require('./entity.js').entity;

var entityList = [];
for (var i = 0; i < 5; i++) {
	entityList.push(new entity(i, 0));
}

for (var i = 0; i < 5; i++) {
	var proposer = entityList[i];
	proposer.start_select(entityList);
}