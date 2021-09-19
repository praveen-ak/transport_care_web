import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import DriverList from "./Driverlist";
import Apicall from "../../../Api/Api";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import size from 'lodash'
import { initiateSocket, testing, subscribeDriverLocation, disconnectSocket } from '../../../socketio'
const AnyReactComponent = ({ text }) => <div className="bg-gradient-primary p-3">{text}</div>;

const SimpleMap = (props) => {
  const history = useHistory();
  const { id } = useParams();
  const [user, setuser] = useState([]);
  const [areaBounds, set_areaBounds] = useState({north: 10.025032404139075, south: 9.809603859063477, east: 78.13371539407594, west: 77.95896411233765});
  const [center, set_center] = useState({
    lat: 9.9252,
    lng: 78.1198,
  });
  const [zoom, set_zoom] = useState(11);

  const getdata = async () => {
    let inputs = { role: "2" }
    inputs['search_by_map'] = true;
    console.log("getdata -> areaBounds", areaBounds)
    inputs['areas'] = areaBounds;
    console.log("getdata -> inputs", inputs)
    await Apicall(inputs, "/user/get_driver_locations").then((res) => {
      setuser(res.data.data.result);
    });
  };
  useEffect(() => {
    console.log("SimpleMap -> areaBounds", areaBounds)
    getdata()
    // initiateSocket();
    // subscribeDriverLocation((err,data)=>{
    //   console.log(data)
    // })
    // return () => {
    //   disconnectSocket();
    // }
  }, [areaBounds]);

  const _onBoundsChange = (center, zoom, bounds, marginBounds) => {
    console.log(marginBounds, bounds, "margin bound");

  };

  return (
    <div>
      <div>
        <DriverList />
      </div>
      <div style={{ height: "100vh", width: "100%", marginTop: 5 }}>
        <GoogleMapReact
          defaultCenter={center}
          defaultZoom={zoom}
          onGoogleApiLoaded={({ map, maps }) => {
            map.addListener("dragend", function (event) {
              var bounds = map.getBounds();
              var areaBounds = {
                north: bounds.getNorthEast().lat(),
                south: bounds.getSouthWest().lat(),
                east: bounds.getNorthEast().lng(),
                west: bounds.getSouthWest().lng()
              };
              console.log("SimpleMap -> areaBounds", areaBounds)
              set_areaBounds(areaBounds)
            });
            map.addListener("zoom_changed", function (event) {
              var bounds = map.getBounds();
              var areaBounds = {
                north: bounds.getNorthEast().lat(),
                south: bounds.getSouthWest().lat(),
                east: bounds.getNorthEast().lng(),
                west: bounds.getSouthWest().lng()
              };
              set_areaBounds(areaBounds)
            });
          }}
        >
          {size(user) && user.map(data => {
            let lat_0 = data.location?.coordinates[0] || 0
            let lng_0 = data.location?.coordinates[1] || 0
            if (lat_0 && lng_0) {
              return (
                <AnyReactComponent lat={lat_0} lng={lng_0} text={data.name} />
              )
            }
          }
          )}
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default SimpleMap;
