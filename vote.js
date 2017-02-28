/**
 * Vote
 */
 var vote = function(pok, n, v) {
 	 this.type = -1; //1:prepare, 2:accept
     this.pok = pok;
     this.num = n;
     this.value = v;
 }

 module.exports.vote = vote;