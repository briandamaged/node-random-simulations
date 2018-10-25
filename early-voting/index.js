
const _ = require('lodash');


const candidates = [
  "Stan Laurel",
  "Oliver Hardy",
];


function createVoter() {
  return {
    p_early: (Math.random() * 0.5),
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


const CENTER = 0.35;
function getDesperation(d) {
  const aligned = d - CENTER;
  return Math.pow(2, (-5 * Math.pow(aligned, 2)) + (-100 * Math.pow(aligned, 4)));
}

function foo(p, d) {
  const X = ((d) * (1 - Math.pow((p - 1), 2)));
  const Y = ((1 - d) * (Math.pow(p, 2)));
  return (X + Y);
}


function InformedVotingSimulator(details) {
  function simulateInformedVoting(voter) {
    const d = getDesperation(details[voter.choice].percentage)

    const p = foo(voter.p_vote, d);

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
}






function go() {
  const voters = _.times(1000, createVoter);

  const idealizedResults = summarizeResults(voters);
  console.log("If EVERYBODY votes:");
  console.log(JSON.stringify(idealizedResults, null, 2));




  const regularResults = [];
  const informedResults = [];


  _.times(100, function() {
    const {
      earlyVoters, remainingVoters, earlyResults,
    } = conductEarlyVoting(voters);

    const simulateInformedVoting = InformedVotingSimulator(earlyResults.details);

    _.times(20, function() {
      const regularVoters = remainingVoters.filter(simulateRegularVoting);
      regularResults.push(summarizeResults(earlyVoters.concat(regularVoters)));

      const informedVoters = remainingVoters.filter(simulateInformedVoting);
      informedResults.push(summarizeResults(earlyVoters.concat(informedVoters)));
    });

  });



  console.log();
  console.log("If people are not aware of early results:");
  const regularVictories = summarizeVictories(regularResults)
  console.log(JSON.stringify(regularVictories, null, 2));
  console.log(regularVictories[idealizedResults.winner].percentage);

  console.log();
  console.log("If people are aware of early results:");
  const informedVictories = summarizeVictories(informedResults);
  console.log(JSON.stringify(informedVictories, null, 2));
  console.log(informedVictories[idealizedResults.winner].percentage);



}



go();

