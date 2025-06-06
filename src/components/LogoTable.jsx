import { useState, useEffect } from 'react'
import { handleSort, imgPath } from '../utils';
import PropTypes from 'prop-types';

function LogoTable({sport}){
    const [data,setData] = useState([]);
    const [sorted,setSorted] = useState({key:"wins",dir:"asc"});
    const [winsDict,setWinsDict] = useState([]);
    const [maxWins, setMaxWins] = useState(0);
    const [loading,setLoading] = useState(true);

    const connection = 'api/fetch';

    useEffect(() => {
        // Fetch teams data from the API
        setLoading(true);
        fetch(connection)
          .then(response => response.json())
          .then(data => data[`${sport}_standings`])
          .then(data => data.sort((a,b) => a.pick - b.pick))
          .then(data => {
                let max = 0;
                let temp = {};
                const newData = data.reduce((acc, team) => {
                    temp[team.abbrev] = team.wins;
                    if (!acc[team.owner]) {
                        acc[team.owner] = { wins: 0, games: 0, teams: [] };
                    }
                    let w = parseInt(team.wins);
                    let g = parseInt(team.games);
                    max = Math.max(w,max);
                    acc[team.owner].wins += w;  // Sum the wins
                    acc[team.owner].games += g;  // Sum the games
                    acc[team.owner].teams.push(team.abbrev);        // Collect team names
                    return acc;
                }, {});
                setMaxWins(max);
                setWinsDict(temp);
                return newData;
            })
          .then(data => Object.entries(data).map(([owner, { wins, games, teams }]) => ({
                owner,
                wins,
                games,
                teams: teams.join(' ')
            })))
          .then(data => data.sort((a,b) => b.wins - a.wins))
          .then(data => setData(data))
          .then(() => setLoading(false))
          .catch(error => console.error('Error fetching data:', error));
      }, [sport]);

    const sortingUtil = [sorted,setSorted,data,setData];

    return (
        <>
            {loading ? <p>Loading..</p> : 
                <table className="LogoTable">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("owner",sortingUtil)}>Owner</th>
                            <th onClick={() => handleSort("wins",sortingUtil,"asc")}>Wins</th>
                            <th style={{cursor: 'default'}}>Teams</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.owner} style={{height: 60}}>
                                <td>{item.owner}</td>
                                {/* <td>{`${item.wins}-${item.games - item.wins}`}</td> */}
                                <td>
                                    <div className='flex flex-col'>
                                        <p className='text-sm'>{item.wins}</p>
                                        <p style={{'fontSize': '0.6em', 'marginTop': '-0.5em'}}>{`Games: ${item.games}`}</p>
                                    </div>
                                </td>
                                <td style={{}}>{item.teams.split(' ').map((abbrev,idx) =>{
                                    const exp = sport == 'mlb' ? 2 : 1;
                                    const scaled = (winsDict[abbrev]/maxWins)**exp;
                                    const w = Math.max(3,50*scaled);
                                    return <img key={idx} src={imgPath(sport,abbrev)} alt={abbrev + " Logo"} width={w} style={{ marginLeft: (50-w)/2, marginRight: (50-w)/2}}></img>
                                })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}

LogoTable.propTypes = {
    sport : PropTypes.string.isRequired,
}

export default LogoTable;