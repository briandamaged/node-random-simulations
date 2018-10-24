
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


function InformedVotingSimulator(details) {
  function simulateInformedVoting(voter) {
    const desperation = (1 - details[voter.choice].percentage);
    const p = Math.sqrt(voter.p_vote * desperation);

    return (Math.random() <= p);
  }

  return simulateInformedVoting;
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



function summarizeVictories(results) {
  const retval = Object.create(null);

  for(const {winner} of results) {
    retval[winner] = retval[winner] || {victories: 0};
    retval[winner].victories++;
  }

  for(const k in retval) {
    retval[k].percentage = retval[k].victories / results.length;
  }

  return retval;
}



function conductEarlyVoting(voters) {
  const phase1 = _.groupBy(voters, simulateEarlyVoting);

  const earlyVoters = phase1[true];
  const remainingVoters = phase1[false];

  const earlyResults = summarizeResults(earlyVoters);

  return {
    earlyVoters, remainingVoters, earlyResults,
  };

  // const simulateInformedVoting = InformedVotingSimulator(earlyResults.details);


  // const regularVoters = simulateRegularVoting(remainingVoters);
  // const informedVoters = simulateInformedVoting(remainingVoters);


  // return earlyVoters;
}






function go() {
  const voters = _.times(500, createVoter);

  console.log("If EVERYBODY votes:");
  console.log(JSON.stringify(summarizeResults(voters), null, 2));



  const {
    earlyVoters, remainingVoters, earlyResults,
  } = conductEarlyVoting(voters);


  console.log("Early voting results:");
  console.log(JSON.stringify(earlyResults, null, 2));




  const simulateInformedVoting = InformedVotingSimulator(earlyResults.details);

  const regularResults = _.times(1000, function() {
    const regularVoters = remainingVoters.filter(simulateRegularVoting);
    return summarizeResults(earlyVoters.concat(regularVoters));
  });


  console.log("If people are not aware of blind results:");
  console.log(JSON.stringify(summarizeVictories(regularResults), null, 2));


  const informedResults = _.times(1000, function() {
    const informedVoters = remainingVoters.filter(simulateInformedVoting);
    return summarizeResults(earlyVoters.concat(informedVoters));
  });


  console.log("If people are aware of blind results:");
  console.log(JSON.stringify(summarizeVictories(informedResults), null, 2));



}



go();

