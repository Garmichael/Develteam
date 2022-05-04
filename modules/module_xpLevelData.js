module.exports = function (xp) {
    let xpChart = [0, 10, 30, 60, 100, 150, 210, 280, 360, 450],
        xpLevel = 0,
        xpGainedForThisLevel = 0,
        xpLevelMinXp,
        xpLevelMaxXp,
        totalXpForLevel,
        xpPercentGainedForThisLevel,
        xpForNextLevel,
        xpUntilNextLevel;

    for (let i = 0; i < xpChart.length; i++) {
        if (xp >= xpChart[i]) {
            xpLevel = i;
        }
    }

    xpGainedForThisLevel = xp - xpChart[xpLevel];
    xpLevelMinXp = xpChart[xpLevel];
    xpLevelMaxXp = xpLevel < xpChart.length - 1 ? xpChart[xpLevel + 1] : xpChart[xpChart.length - 1];
    totalXpForLevel = xpLevelMaxXp - xpLevelMinXp;

    xpUntilNextLevel = xpLevelMaxXp - xpGainedForThisLevel;


    xpPercentGainedForThisLevel = Math.floor(xpGainedForThisLevel / totalXpForLevel * 100);


    if (xp === xpChart[xpChart.length - 1]) {
        xpPercentGainedForThisLevel = 100;
        xpUntilNextLevel = 0;
        xpGainedForThisLevel = xpChart[xpChart.length - 1];
    }

    return {
        xpLevel: xpLevel + 1,
        xpUntilNextLevel: xpUntilNextLevel,
        xpForNextLevel: xpLevelMaxXp,
        xpGainedForThisLevel: xpGainedForThisLevel,
        xpPercentGainedForThisLevel: xpPercentGainedForThisLevel
    };

};