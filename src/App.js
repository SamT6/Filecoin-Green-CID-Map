import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./styles/app.css"            

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Card } from 'primereact/card';
import { ScrollPanel } from 'primereact/scrollpanel';

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25,41], 
    iconAnchor: [12,41]
});

L.Marker.prototype.options.icon = DefaultIcon;


const App = () => {
  const { cid } = useParams();
  const navigate = useNavigate();

  const [searchCID, setSearchCID] = useState("");

  useEffect(()=>{
    console.log("searching cid: ", cid);
    
    axios.get(`https://cid.contact/cid/${cid}`)
        .then(result => {
            console.log(result)
        })
  }, [cid]);

  const handleClickSearch = (event) => {
    event.preventDefault();
    navigate(`/${searchCID}`);
  }

  const position = [51.505, -0.09]

  return (
    <div>
      <h2 className="special-font">Filecoin Green CID Map</h2>
      <div className="grid p-fluid" style={{marginLeft: 50, marginRight: 50}}>
          <div className="col-12 md:col-4">
              <div className="p-inputgroup">
                  <InputText placeholder="CID" value={searchCID} onChange={(e) => setSearchCID(e.target.value)}/>
                  <Button style={{backgroundColor: "#54A97E", border: "0px"}} label="Search" onClick={handleClickSearch}/>
              </div>
          </div>
      </div>

      <Splitter style={{height: '550px', marginTop: "20px"}} layout="horizontal">
        <SplitterPanel size={70} minSize={50}>
          <div style={{margin: 10}}>
            <MapContainer style={{height: "500px"}} center={position} zoom={3} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </SplitterPanel>
        <SplitterPanel size={30} minSize={20}>
          <ScrollPanel style={{width: '100%', height: '100%'}} className="custom-handle">
            <Card title="Title" subTitle="SubTitle" style={{margin: "10px"}}>
              Content
            </Card>
            <Card title="Title" subTitle="SubTitle" style={{margin: "10px"}}>
              Content
            </Card>
            <Card title="Title" subTitle="SubTitle" style={{margin: "10px"}}>
              Content
            </Card>
            <Card title="Title" subTitle="SubTitle" style={{margin: "10px"}}>
              Content
            </Card>
            <Card title="Title" subTitle="SubTitle" style={{margin: "10px"}}>
              Content
            </Card>
          </ScrollPanel>
        </SplitterPanel>
      </Splitter>
    </div>
  );
}

export default App;
