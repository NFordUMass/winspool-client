import { useState, useEffect } from 'react'
import PropTypes from "prop-types"; // Import PropTypes

async function fetchTime(sport){
    const connection = 'api/fetch';
    const response = await fetch(connection);
    const data = await response.json();

    const updatesBySport = {};
    for (const entry of data.updated) {
        updatesBySport[entry.sport] = entry.update_time;
    }
    

    const utcString = updatesBySport[sport];
    const utcDate = new Date(utcString);
    // Convert to local time and format
    const localTimeString = utcDate.toLocaleString("en-US", {
        month: "numeric",  // "Mar"
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,  // Enables AM/PM format
    });
    return localTimeString;
}

function useFetch(key, fetchFunction, state, setState){
    useEffect(() => {
        const checkTime = async () => {
            const date = new Date().toISOString().split("T"); 
            const day = date[0];
            const hour = date[1].split(':')[0]
            const cachedData = JSON.parse(localStorage.getItem(key));

            // If data exists and was fetched today, use it
            if (cachedData && cachedData.day === day && cachedData.hour <= hour) {
                setState(cachedData.value);
            } else {
                // Fetch new data and update the cache
                const fetchedValue = await fetchFunction(key);
                setState(fetchedValue);
                localStorage.setItem(key, JSON.stringify({ day: day, hour: hour, value: fetchedValue }));
            }
        };

        checkTime();
      },[key,fetchFunction]);

      return state;
}

export default function Update({sport}){
    const [updated,setUpdated] = useState(null);
    useFetch(sport,fetchTime,updated,setUpdated);

    if(!updated) return <p>Loading...</p>

    return (
        <p>{`Last updated: ${updated}`}</p>
        );
}

Update.propTypes = {
    sport: PropTypes.string
}