import { useState, useEffect } from "react";

export default function AttractionsPanel({ location }) {

  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    if(!location?.lat) return;

    fetch(`http://localhost:5000/api/attractions?lat=${location.lat}&lon=${location.lon}&city=${location.city}`)
      .then(r=>r.json())
      .then(d=>{
        setData(d);
        setLoading(false);
      });

  },[location?.lat]);

  if(loading)
    return(
      <div className="card">
        <div className="card-title">🗺 Places & Food</div>
        <p>Finding famous places near {location?.city}...</p>
      </div>
    );

  const renderList = (list,icon) =>
    list?.slice(0,8).map((p,i)=>(
      <div key={i} style={{
        border:"1px solid var(--border)",
        padding:12,
        borderRadius:8,
        marginBottom:8
      }}>
        <div style={{fontWeight:600}}>
          {icon} {p.name}
        </div>

        <div style={{fontSize:12,color:"var(--muted)"}}>
          {p.address}
        </div>

        <a
          href={`https://www.google.com/maps?q=${p.lat},${p.lon}`}
          target="_blank"
          rel="noreferrer"
          style={{fontSize:12,color:"var(--gold)"}}
        >
          Open in Maps →
        </a>
      </div>
    ));

  return(

    <div style={{display:"flex",flexDirection:"column",gap:20}}>

      <div className="card">
        <div className="card-title">🏛 Famous Places & Monuments</div>
        {renderList(data?.monuments,"🏛")}
      </div>

      <div className="card">
        <div className="card-title">🛕 Temples</div>
        {renderList(data?.temples,"🛕")}
      </div>

      <div className="card">
        <div className="card-title">🏖 Beaches</div>
        {renderList(data?.beaches,"🏖")}
      </div>

      <div className="card">
        <div className="card-title">🍴 Famous Food & Restaurants</div>
        {renderList(data?.food,"🍴")}
      </div>

    </div>

  );

}
