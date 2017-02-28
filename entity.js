var vote = require('./vote.js').vote;
var answer = require('./answer.js').answer;

var entity = function(id, pok) {
    this.id = id;
    this.pok = pok;
    this.acceptN = -1;
    this.acceptV = -1;
    this.maxN = -1;
    this.num = this.id;
    this.val = this.id;

    this.start_select = function(entityList) {
    	var answerList = [];
    	for (var i = 0; i < entityList.length; i++) {
    		answerList.push(this.send_prepare_req(i, this.pok, this.num, this.val, entityList));
    	}
    	console.log('Entity ' + this.id  + ' answerList: ' + JSON.stringify(answerList));
    	if (!this.judge_prepare(answerList, entityList)) {
    		console.log('Entity ' + this.id + ' did not get majority in prepare request');
    		this.num += entityList.length;
    		this.start_select(entityList);
    	} else {
    		console.log('Entity ' + this.id + ' get majority in prepare request');
    		var acceptVote = this.pick_accept_value(answerList);
    		console.log('Entity ' + this.id + ' pick up value ' + JSON.stringify(acceptVote));
    		var acceptAnswerList = [];
    		for (var i = 0; i < entityList.length; i++) {
    			acceptAnswerList.push(this.send_accept_req(i, this.pok, this.num, acceptVote.value, entityList));
    		}
    		console.log('Entity ' + this.id + ' acceptAnswerList ' + JSON.stringify(acceptAnswerList));
    		if (!this.judge_accept(acceptAnswerList, entityList)) {
    			this.num += entityList.length;
    			this.start_select(entityList);
    		} else {
    			console.log('Entity ' + this.id + ' has chosen value ' +  acceptVote.value)
    		}
    	}

    }

    this.send_prepare_req = function(id, pok, n, v, entityList) {
    	var newVote = new vote(pok, n, v);
    	var anotherEntity = entityList[id];
    	return anotherEntity.process_prepare_req(newVote);
    }

    this.process_prepare_req = function(newVote) {
    	console.log('entity ' + this.id + ' recieve prepare request ' + JSON.stringify(newVote));
    	console.log('entity ' + this.id + ' current node is ' + JSON.stringify(this));
    	var ret;
    	if (this.maxN == -1) {
    		this.maxN = newVote.num;
    		ret = new answer('ok', newVote.pok, newVote.num, newVote.value);
    	} else {

    		if (this.maxN > newVote.num) {
    			ret = new answer('error', newVote.pok, -1, -1);
    		} else {
    			this.maxN = newVote.num;
    			if (this.acceptN == -1) {
    				ret = new answer('ok', newVote.pok, -1, -1);
    			} else {
    				ret = new answer('ok', newVote.pok, this.acceptN, this.acceptV);
    				console.log('answer is ' + JSON.stringify(ret));
    			}
    		}
    	}
    	return ret;
    }

    this.judge_prepare = function(answerList, entityList) {
    	var majority = parseInt(entityList.length / 2);
    	if (answerList.length <= majority) {
    		return false;
    	}
    	//console.log('majority ' + majority);
    	//console.log('answerList in  judge_prepare ' + JSON.stringify(answerList));
    	var count = 0;
    	for (var i in answerList) {
    		var a = answerList[i];
    		if (a.status == 'ok') {
    			count++;
    		}
    	}
    	if (count > majority) {
    		return true;
    	}
    	return false;
    }

    this.pick_accept_value = function(answerList) {
    	var known_max_n = -1;
    	var pickv = -1;
    	for (var i in answerList) {
    		var a = answerList[i];
    		if (!a.status == 'ok') {
    			continue;
    		}
    		if (a.num > known_max_n) {
    			known_max_n = a.num;
    			pickv = a.value;
    		}
    	}
    	if (known_max_n == -1) {
    		return new vote(this.pok, this.num, this.id);
    	} else {
    		return new vote(this.pok, this.num, pickv);
    	}
    }

    this.send_accept_req = function(id, pok, n, v, entityList) {
    	var newVote = new vote(pok, n, v);
    	var anotherEntity = entityList[id];
    	return anotherEntity.process_accept_req(newVote);
    }

    this.process_accept_req = function(newVote) {
    	console.log('entity ' + this.id + ' recieve accept_req ' + JSON.stringify(newVote) + ' current maxN is ' + this.maxN);
    	if (newVote.num < this.maxN) {
    		return new answer('error', newVote.pok, -1, -1);
    	} else {
    		this.acceptN = newVote.num;
    		this.acceptV = newVote.value;
    		console.log('entity ' + this.id + ' acceptN is ' + this.acceptN + ' acceptV is ' + this.acceptV);
    		return new answer('ok', newVote.pok, this.acceptN, this.acceptV);
    	}
    }

    this.judge_accept = function(answerList, entityList) {
    	var majority = parseInt(entityList.length / 2);
    	if (answerList.length <= majority) {
    		return false;
    	}
    	var count = 0;
    	for (var i in answerList) {
    		var a = answerList[i];
    		if (a.status == 'ok') {
    			count++;
    		}
    	}
    	if (count > majority) {
    		return true;
    	}
    	return false;
    }
}

module.exports.entity = entity;