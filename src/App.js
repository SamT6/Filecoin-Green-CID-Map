import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./styles/app.css"            

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Card } from 'primereact/card';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Toast } from 'primereact/toast';


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
  const toast = useRef(null);

  const [searchCID, setSearchCID] = useState("");
  const [providers, setProviders] = useState([]);

  useEffect(()=>{
    console.log("searching cid: ", cid);
    setSearchCID(cid);
    handleRequests()
  }, [cid]);

  const handleRequests = () => {
    if(cid){
      axios.get(`https://cid.contact/cid/${cid}`)
      .then(result => {
          console.log(result);
          console.log(result.data.MultihashResults[0].ProviderResults)
          setProviders(result.data.MultihashResults[0].ProviderResults.map(element => element.Provider))
      })
      .catch(error => {
        console.log(error);
        showError()
      });
    }
  }

  const handleClickSearch = (event) => {
    event.preventDefault();
    navigate(`/${searchCID}`);
    handleRequests()
  }

  const showError = () => {
    toast.current.show({severity:'error', summary: 'Error!', detail: `Could not retrieve Peers for CID (This probably means your CID is on IPFS but not on Filecoin)`, life: 3000});
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
        <SplitterPanel size={55} minSize={30}>
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
        <SplitterPanel size={45} minSize={20}>
          <ScrollPanel style={{width: '100%', height: '100%'}} className="custom-handle">
            {
              providers.map((provider, index) => {
                return(
                  <Card title="Title" subTitle="SubTitle" style={{margin: "10px"}} key={index}>
                    <div style={{wordBreak: "break-all"}}>
                      <p> {`Peer ID: ${provider.ID}`}</p>
                    </div>
                  </Card>
                )
              })
            }
          </ScrollPanel>
        </SplitterPanel>
      </Splitter>

      <Toast ref={toast} position="bottom-right"/>
    </div>
  );
}

export default App;
