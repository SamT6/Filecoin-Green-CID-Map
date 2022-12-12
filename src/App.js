import React, {useState, useEffect} from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useParams, useNavigate } from 'react-router-dom';

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'

const App = () => {
  const { cid } = useParams();
  const navigate = useNavigate();

  const [searchCID, setSearchCID] = useState("");

  useEffect(()=>{
    console.log("searching cid: ", cid);
  }, [cid]);

  const handleClickSearch = (event) => {
    event.preventDefault();
    navigate(`/${searchCID}`);
  }

  return (
    <div>
      <h2 className="special-font">Filecoin Green CID Map</h2>
      <div className="grid p-fluid" style={{marginLeft: 50, marginRight: 50}}>
          <div className="col-12 md:col-4">
              <div className="p-inputgroup">
                  <InputText placeholder="CID" value={searchCID} onChange={(e) => setSearchCID(e.target.value)}/>
                  <Button style={{backgroundColor: "#00BE52", border: "0px"}} label="Search" onClick={handleClickSearch}/>
              </div>
          </div>
      </div>
      <div style={{marginTop: 50}}>
        <MapContainer style={{height: "500px"}} center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
