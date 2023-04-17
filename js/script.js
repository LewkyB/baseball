// MLB API DOCS: https://controlc.com/b71582de

init();

sportsSelect.addEventListener("change", async (event) => {
  const teams = await getTeams();
  populateTeamsSelect(teams);
});

statGroupsSelect.addEventListener("change", async (event) => {
    await showTeamStats();
});

statTypesSelect.addEventListener("change", async (event) => {
    await showTeamStats();
});

teamsSelect.addEventListener("change", async (event) => {
  await showTeamStats();
});

playersSelect.addEventListener("change", async (event) => {
  await showPlayerStats();
});

playerStatTypesSelect.addEventListener("change", async (event) => {
  await showPlayerStats();
});

async function init() {
  await getSports().then((sports) => {
    populateSportsSelect(sports);
  });

  await getTeams().then((teams) => {
    teams = teams;
    populateTeamsSelect(teams);
  });

  await getRoster(teamsSelect.value).then((roster) => {
    populatePlayersSelect(roster);
  });

  await populateStatTypes("statTypesSelect");
  await populateStatTypes("playerStatTypesSelect");

  await populateStatGroups();

  await showPlayerStats();
  await showTeamStats();
}

function populatePlayersSelect(roster) {
  playersSelect.options.length = 0;

  roster.forEach((player) => {
    const optionElement = document.createElement("option");
  
    optionElement.value = player.person.id;
    optionElement.text = player.person.fullName;
  
    playersSelect.add(optionElement);
  });
}

async function populateStatTypes(selectElementId) {
  const statTypesSelect = document.getElementById(selectElementId);
  const statTypes = await getStatTypes();

  statTypes.forEach((statType) => {
    const optionElement = document.createElement("option");

    optionElement.value = statType.displayName;
    optionElement.text = statType.displayName;

    statTypesSelect.add(optionElement);
  });
}

async function populateStatGroups() {
  const statGroupsSelect = document.getElementById("statGroupsSelect");
  const statGroups = await getStatGroups();

  statGroups.forEach((statGroup) => {
    const optionElement = document.createElement("option");

    optionElement.value = statGroup.displayName;
    optionElement.text = statGroup.displayName;

    statGroupsSelect.add(optionElement);
  });
}

function populateSportsSelect(sports) {
  const sportsSelect = document.getElementById("sportsSelect");

  sports.forEach((sport) => {
    const optionElement = document.createElement("option");

    optionElement.value = sport.id;
    optionElement.text = sport.name;

    sportsSelect.add(optionElement);
  });
}

function populateTeamsSelect(teams) {
  const teamsSelect = document.getElementById("teamsSelect");
  const sportsSelect = document.getElementById("sportsSelect");

  teamsSelect.options.length = 0;

  const filteredTeams = teams.filter(
    (team) => team.sport.id == sportsSelect.value
  );

  filteredTeams.forEach((team) => {
    const optionElement = document.createElement("option");

    optionElement.value = team.id;
    optionElement.text = team.name;

    teamsSelect.add(optionElement);
  });
}

async function getSports() {
  return await fetch("https://statsapi.mlb.com/api/v1/sports")
    .then((response) => response.json())
    .then((data) => {
      return data.sports;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getTeams() {
  return await fetch(`https://statsapi.mlb.com/api/v1/teams`)
    .then((response) => response.json())
    .then((data) => {
      return data.teams;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getRoster(teamId) {
  return await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster`)
    .then((response) => response.json())
    .then((data) => {
      return data.roster;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getPlayerStats(playerId, statType, group) {
  return await fetch(
    `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=${statType}&group=${group}`
  )
    .then((response) => response.json())
    .then((data) => {
      //   return data.stats[0].splits[0].stat;
      return data.stats[0];
    })
    .catch((error) => {
      console.error(error);
    });
}

async function showPlayerStats() {
  try {
    const playerId = playersSelect.value;
    const roster = await getRoster(teamsSelect.value);
    const selectedPlayerOnRoster = roster.find(
      (player) => player.person.id == playerId
    );
    const playerPostionType = selectedPlayerOnRoster.position.type;

    let playerStats;
    // how to handle two way players like ohtani
    if (playerPostionType === "Pitcher") {
      playerStats = await getPlayerStats(
        playerId,
        playerStatTypesSelect.value,
        "Pitching"
      );
    } else {
      playerStats = await getPlayerStats(
        playerId,
        playerStatTypesSelect.value,
        "Hitting"
      );
    }

    const playerStatsFormattedJson = JSON.stringify(playerStats, null, 2);
    playerStatsOutput.innerHTML = `<pre>${playerStatsFormattedJson}</pre>`;
  } catch (error) {
    console.error(error);
  }
}

async function getTeamStats(teamId, statType, group) {
  return await fetch(
    `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=${statType}&group=${group}`
    // `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats&group=${group}`
  )
    .then((response) => response.json())
    .then((data) => {
      //   return data.stats[0].splits;
      console.log(data);
      if (data.stats[0] === undefined) {
        return data.stat;
      }
      return data.stats[0];
    })
    .catch((error) => {
      console.error(error);
    });
}

async function showTeamStats() {
  try {
    teams = await getTeams();
    team = teams.find((team) => team.id == teamsSelect.value);

    const statTypesSelect = document.getElementById("statTypesSelect");
    const teamStats = await getTeamStats(
      team.id,
      statTypesSelect.value,
      statGroupsSelect.value
    );
    console.log(teamStats);
    const teamJsonFormatted = JSON.stringify(teamStats, null, 2);
    output.innerHTML = `<pre>${teamJsonFormatted}</pre>`;

    selectedTeamRoster = await getRoster(team.id);
    populatePlayersSelect(selectedTeamRoster);
  } catch (error) {
    console.error(error);
  }
}

async function getStatTypes() {
  return await fetch(
    `https://statsapi.mlb.com/api/v1/statTypes`
    // `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats&group=${group}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getStatGroups() {
  return await fetch(
    `https://statsapi.mlb.com/api/v1/statGroups`
    // `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats&group=${group}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
}
