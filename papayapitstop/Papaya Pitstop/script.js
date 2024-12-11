const tires = {
    soft: { maxLaps: 25, baseLapTime: 91, degradation: 0.05 },
    medium: { maxLaps: 35, baseLapTime: 96, degradation: 0.04 },
    hard: { maxLaps: 45, baseLapTime: 101, degradation: 0.02 },
    intermediate: { maxLaps: 25, baseLapTime: 110, degradation: 0.05 },
    wet: { maxLaps: 25, baseLapTime: 115, degradation: 0.06 }
};

function generateStrategy() {
    document.getElementById("loadingMessage").style.display = "block";
    document.getElementById("generateStrategy").disabled = true;
    document.getElementById("strategyResults").innerHTML = "";
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("finalTime").innerHTML = "";

    const laps = parseInt(document.getElementById("laps").value);
    const degradation = document.getElementById("degradation").value;
    const weather = document.getElementById("weather").value;
    const pitStopNormal = parseInt(document.getElementById("pitStopNormal").value);
    const pitStopSC = parseInt(document.getElementById("pitStopSC").value);
    const risk = document.getElementById("risk").value;
    const startTire = document.getElementById("startTire").value; // Get starting tire choice

    if (isNaN(laps) || laps <= 0) {
        document.getElementById("errorMessage").style.display = "block";
        document.getElementById("loadingMessage").style.display = "none";
        document.getElementById("generateStrategy").disabled = false;
        return;
    }

    let availableTires = [];
    if (weather === "dry") availableTires = ["soft", "medium", "hard"];
    else if (weather === "damp") availableTires = ["intermediate"];
    else if (weather === "wet") availableTires = ["wet"];

    let tireDegradation;
    if (degradation === "small") tireDegradation = 0.8;
    else if (degradation === "medium") tireDegradation = 1.0;
    else tireDegradation = 1.2;

    let strategy = [];
    let totalTime = 0;
    let currentLap = 1;
    let currentTire = startTire; // Start with the chosen tire
    let pitStopCount = 0;

    async function calculateStrategy() {
        let maxPitStops = 3;
        
        strategy.push(`Start: ${startTire.charAt(0).toUpperCase() + startTire.slice(1)}s`); // Show starting tire

        while (currentLap <= laps) {
            let maxLaps = tires[currentTire].maxLaps;

            if (risk === "risky" && Math.random() < 0.3) maxLaps += 5;

            if (currentLap + maxLaps > laps) maxLaps = laps - currentLap;

            let lapTime = tires[currentTire].baseLapTime * (1 + tires[currentTire].degradation * tireDegradation);
            lapTime = Math.round(lapTime);

            // Gradually increase degradation over each lap
            for (let lap = currentLap; lap < currentLap + maxLaps; lap++) {
                totalTime += lapTime;
                lapTime = Math.round(lapTime * (1 + tires[currentTire].degradation)); // Increase degradation each lap
            }

            currentLap += maxLaps;

            // If we haven't reached the final lap and need to pit, change tires
            if (currentLap < laps && pitStopCount < maxPitStops) {
                currentTire = availableTires[(availableTires.indexOf(currentTire) + 1) % availableTires.length];
                pitStopCount++;
                totalTime += pitStopNormal; // Add time for the pit stop
                strategy.push(`Pit Stop at Lap ${currentLap}: Switch to ${currentTire.charAt(0).toUpperCase() + currentTire.slice(1)}s`);
            }

            if (currentLap >= laps) break;
        }

        // Format total time in HH:MM:SS.mmm
        let finalHours = Math.floor(totalTime / 3600);
        let finalMinutes = Math.floor((totalTime % 3600) / 60);
        let finalSeconds = totalTime % 60;
        let finalMilliseconds = Math.round((totalTime % 1) * 1000); // Get milliseconds

        let finalTimeString = `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}.${String(finalMilliseconds).padStart(3, '0')}`;

        document.getElementById("strategyResults").innerHTML = strategy.join("<br>");
        document.getElementById("finalTime").innerHTML = finalTimeString;

        document.getElementById("loadingMessage").style.display = "none";
        document.getElementById("generateStrategy").disabled = false;
    }

    try {
        calculateStrategy();
    } catch (error) {
        document.getElementById("errorMessage").style.display = "block";
        document.getElementById("loadingMessage").style.display = "none";
        document.getElementById("generateStrategy").disabled = false;
    }
}

document.getElementById("generateStrategy").addEventListener("click", generateStrategy);
