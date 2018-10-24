
const _ = require('lodash');


const candidates = [
  "Stan Laurel",
  "Oliver Hardy",
];


function createVoter() {
  return {
    p_early: (Math.random() * 0.1),
    p_vote: Math.random(),
    choice: _.sample(candidates),
  }
}


function simulateEarlyVoting(voter) {
  return (Math.random() <= voter.p_early);
}

function simulateRegularVoting(voter) {
  return (Math.random() <= voter.p_vote);
}



function tallyResults(voters) {
  const groupings = _.groupBy(voters, (v)=> v.choice);
  const results = Object.create(null);

  for(const k in groupings) {
    results[k] = groupings[k].length;
  }

  return results;
}

function _summarizeResults(results) {
  const total = Object.values(results).reduce((s, v)=> s + v, 0);

  let winner;
  let highestVotes = -1;
  const details = Object.create(null);
  for(const k in results) {
    details[k] = {
      votes: results[k],
      percentage: results[k] / total,
    }

    if(results[k] > highestVotes) {
      highestVotes = results[k];
      winner = k;
    }
  }

  return {
    details,
    winner,
  };
}


function summarizeResults(voters) {
  return _summarizeResults(tallyResults(voters));
}



const voters = _.times(100, createVoter);


console.log(JSON.stringify(summarizeResults(voters), null, 2));
