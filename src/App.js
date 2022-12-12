import React, {useState} from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';


const App = () => {
  const [cid, setCID] = useState("");


  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(cid);
  }

  return (
    <div>
      <h2 className="special-font">Filecoin Green CID Map</h2>
      <div className="grid p-fluid">
          <div className="col-12 md:col-4">
              <div className="p-inputgroup">
                  <InputText placeholder="CID" value={cid} onChange={(e) => setCID(e.target.value)}/>
                  <Button style={{backgroundColor: "#00BE52", border: "0px"}} label="Search" onClick={handleSubmit}/>
              </div>
          </div>
      </div>



    </div>
  );
}

export default App;
