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
import { Tag } from 'primereact/tag';

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

const corner1 = L.latLng(-90, -200)
const corner2 = L.latLng(90, 200)
const bounds = L.latLngBounds(corner1, corner2)


const App = () => {
  const { cid } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const [searchCID, setSearchCID] = useState("");
  const [providers, setProviders] = useState([]);
  const [minerIds, setMinerIds] = useState([])
  const [peerIdToMinerId, setPeerIdToMinerId] = useState({});
  const [minerIdToLocation, setMinerIdToLocation] = useState({});
  const [minerIdToEnergy, setMinerIdToEnergy] = useState({});
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [totalRenewableEnergy, setTotalRenewableEnergy] = useState(0);

  useEffect(()=>{
    console.log("searching cid: ", cid);
    setSearchCID(cid);
    fetchProviders()
  }, [cid]);

  const fetchProviders = () => {
    if(cid){
      axios.get(`https://cid.contact/cid/${cid}`)
      .then(result => {
          console.log(result.data.MultihashResults[0].ProviderResults)
          fetchMinerIds(result.data.MultihashResults[0].ProviderResults.map(element => element.Provider.ID))
          setProviders(result.data.MultihashResults[0].ProviderResults.map(element => element.Provider))
      })
      .catch(error => {
        console.log(error);
        showError()
      });
    }
  }

  const fetchMinerIds = (peer_ids) => {
    const listOfPeerIds = peer_ids.reduce((accumulator, currentProvider, currentIndex) => {
      if(currentIndex === 0)
        return accumulator + currentProvider;
      else 
      return accumulator + "," + currentProvider;
    }, "");

    axios.get(`https://green.filecoin.space/minerid-peerid/api/v1/miner-id?peer_id=${listOfPeerIds}`)
          .then(result => {
            let map = {};
            let list = [];
            result.data.forEach(element => {
              map[element.PeerId] = element.MinerId;
              list.push(element.MinerId);
            });
            fetchMinerEnergy(list);
            fetchMinerLocations(list);
            
            setPeerIdToMinerId(map);
            setMinerIds(list);
          })
          .catch(error => {
            console.log(error);
          });
  }

  const fetchMinerEnergy = (miner_ids) => {
    let minerEnergyInfo = {};
    let totalEnergy = 0;
    let totalRenewableEnergy = 0;

    miner_ids.forEach(id => {
      let minerInfo = {};
      // get Total amount of data stored by minerID
      axios.get(`https://api.filgreen.d.interplanetary.one/models/model?code_name=CapacityModel&filter=month&miner=${id}`)
      .then(result => {
        minerInfo["total_data"] = result.data.data[0].data.slice(-1)[0].value + " " + result.data.y;
        // console.log("total data: ", minerInfo["total_data"]);
      })

      // get Lower bound, upper bound, and estimate of total energy used by this minerID
      axios.get(`https://api.filgreen.d.interplanetary.one/models/model?code_name=CumulativeEnergyModel_v_1_0_1&filter=month&miner=${id}`)
      .then(result => {
        minerInfo["upper_bound_energy"] = result.data.data[2].data.slice(-1)[0].value + " " + result.data.y;
        minerInfo["lower_bound_energy"] = result.data.data[0].data.slice(-1)[0].value + " " + result.data.y;
        minerInfo["estimate_energy"] = result.data.data[1].data.slice(-1)[0].value + " " + result.data.y;
        // console.log("upper bound: ", minerInfo["upper_bound_energy"]);
        // console.log("lower bound: ", minerInfo["lower_bound_energy"]);
        // console.log("estimate: ", minerInfo["estimate_energy"]);
        console.log(parseFloat(result.data.data[1].data.slice(-1)[0].value))
        totalEnergy += parseFloat(result.data.data[1].data.slice(-1)[0].value);
        console.log(totalEnergy)
        setTotalEnergy(totalEnergy);

      })

      // get Total amount of renewable energy purchased by this minerID
      axios.get(`https://api.filgreen.d.interplanetary.one/models/model?code_name=RenewableEnergyModel&filter=month&miner=${id}`)
      .then(result => {
        minerInfo["renewable_energy"] = result.data.data[0].data.slice(-1)[0].value + " " + result.data.y;
        // console.log("renewable: ", minerInfo["renewable_energy"]);
        totalRenewableEnergy += parseFloat(result.data.data[0].data.slice(-1)[0].value);
        setTotalRenewableEnergy(totalRenewableEnergy);
      })

      minerEnergyInfo[id] = minerInfo; 
    });

    console.log(minerEnergyInfo)
    setMinerIdToEnergy(minerEnergyInfo);
  }

  const fetchMinerLocations = (miner_ids) => {
    axios.get("https://provider-quest.s3.us-west-2.amazonaws.com/dist/geoip-lookups/synthetic-locations-latest.json")
      .then(result => {
        // console.log(result.data);
        let map = {};
        miner_ids.forEach(element => {
          map[element] = []
        });
        result.data.providerLocations.forEach(element => {
          if(miner_ids.includes(element.provider)){
            map[element.provider].push(element)
          }
        });
        // console.log(map);
        setMinerIdToLocation(map);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const handleClickSearch = (event) => {
    event.preventDefault();
    navigate(`/${searchCID}`);
    fetchProviders();
  }

  const showError = () => {
    toast.current.show({severity:'error', summary: 'Error!', detail: `Could not retrieve Peers for CID (This probably means your CID is on IPFS but not on Filecoin)`, life: 3000});
  }

  const generateMinerLocationMarkers = () => {
    let components = [];
    minerIds.forEach(mid => {
      if(minerIdToLocation[mid]){
        let list = minerIdToLocation[mid].map(minerInfo => {
          const position = [minerInfo.lat, minerInfo.long];
          //console.log(minerInfo);

          return(
            <Marker position={position}>
              <Popup>
                {minerInfo.provider} <br /> 
                {minerInfo.city + ", " + minerInfo.country}
              </Popup>
            </Marker>
          );
        });
        components = components.concat(list);
      }
    });

    return components;
  }

  const generateMinerInfoCards = () => {
    return providers.map((provider, index) => {
      let title = "Not Filecoin Miner"
      if(peerIdToMinerId[provider.ID]){
        const minerId = peerIdToMinerId[provider.ID];
        title = `Miner ID: ${minerId}`

        return(
          <Card title={title} subTitle={`Peer ID: ${provider.ID}`} style={{margin: "10px"}} key={index}>
            <div style={{wordBreak: "break-all"}}>
              <p> Address(es): 
                {provider.Addrs.reduce((accumulator, currentProvider, currentIndex) => {
                    if(currentIndex === 0)
                      return accumulator + currentProvider;
                    else 
                    return accumulator + ", " + currentProvider;
                  }, "")
                } 
              </p>
              <Tag value={"Total data stored: " + minerIdToEnergy[minerId]["total_data"]} severity="primary" style={{margin: "2px"}}></Tag>
              <br></br>
              <Tag value={"Estimated total energy used: " + minerIdToEnergy[minerId]["estimate_energy"]} severity="warning" style={{margin: "2px"}}></Tag>
              <br></br>
              <Tag value={"Lower-bound total energy used: " + minerIdToEnergy[minerId]["lower_bound_energy"]} severity="info" style={{margin: "2px"}}></Tag>
              <br></br>
              <Tag value={"Upper-bound total energy used: " + minerIdToEnergy[minerId]["upper_bound_energy"]} severity="info" style={{margin: "2px"}}></Tag>
              <br></br>
              <Tag value={"Total renewable energy purchased: " + minerIdToEnergy[minerId]["renewable_energy"]} severity="success" style={{margin: "2px"}}></Tag>
            </div>
          </Card>
        )
      }
      else{
        return(
          <Card title={title} subTitle={`Peer ID: ${provider.ID}`} style={{margin: "10px"}} key={index}>
            <div style={{wordBreak: "break-all"}}>
              <p> Address(es): 
                {provider.Addrs.reduce((accumulator, currentProvider, currentIndex) => {
                    if(currentIndex === 0)
                      return accumulator + currentProvider;
                    else 
                    return accumulator + ", " + currentProvider;
                  }, "")
                } 
              </p>                      
            </div>
          </Card>
        )
      }

    })
  }

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
            <MapContainer style={{height: "525px"}} center={[28, 8]} zoom={2} scrollWheelZoom={true} 
                          maxBoundsViscosity={1.0} maxBounds={bounds}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {
                generateMinerLocationMarkers()
              }
            </MapContainer>
          </div>
        </SplitterPanel>
        <SplitterPanel size={45} minSize={20}>
          <ScrollPanel style={{width: '100%', height: '100%'}} className="custom-handle">
            <Card style={{margin: "5px", padding: "2px"}} >
              <div>
                  <p>Total energy ⚡️ used by all minerIDs storing the CID</p>
                  <Tag value={totalEnergy + " kWh"} severity="warning" style={{margin: "2px"}}></Tag>
                  <p>Total renewable energy 🌱 purchased by all minerIDs storing the CID</p>
                  <Tag value={totalRenewableEnergy + " kWh"} severity="success" style={{margin: "2px"}}></Tag>
              </div>
            </Card>
            {
              generateMinerInfoCards()
            }
          </ScrollPanel>
        </SplitterPanel>
      </Splitter>

      <Toast ref={toast} position="bottom-right"/>
    </div>
  );
}

export default App;
