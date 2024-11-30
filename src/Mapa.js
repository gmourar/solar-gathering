import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import './styles/Mapa.css';


const createNumberedIcon = (number) => {
    return L.divIcon({html: `<div style="background-color: #007bff;
    color: white;
    border-radius: 50%;
    width: 10px; 
    height: 10px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: bold;">${number}</div>`,
        className: '',
    });
};

function ClickHandler({ onClick, isDisabled }) {
    useMapEvents({
        click(e) {
            if (!isDisabled) {
                const { lat, lng } = e.latlng;
                onClick(lat, lng);
            }
        },
    });
    return null;
}

function Mapa() {
    const [markers, setMarkers] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const handleMapClick = (lat, lng) => {
        if (markers.length < 4) {
            setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
            // console.log(`Novo marker adicionado: Latitude: ${lat}, Longitude: ${lng}`);
        }
    };

    const handleSendMarkers = async () => {
        setIsSending(true);

        const markersPayload = markers.reduce((acc, marker, index) => {
            acc[`marker${index + 1}`] = {
                latitude: marker.lat.toString(),
                longitude: marker.lng.toString(),
            };
            return acc;
        }, {});

        
        const marker = {markers:markersPayload}
        console.log(JSON.stringify(marker))

        try {
            await axios.post('http://localhost:8080/api/geo/calculate-area', marker);
            alert('Coordenadas enviadas com sucesso!');
            setMarkers([]);
        } catch (error) {
            console.error('Erro ao enviar coordenadas:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleClearMarkers = () => {
        setMarkers([]);
    };

    return (
        <div className="main">
            <div className="map-container">
                <MapContainer center={[0, 0]} zoom={3} style={{height: '100%', width: '100%'}}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ClickHandler onClick={handleMapClick} isDisabled={markers.length >= 4}/>
                    {markers.map((marker, index) => (
                        <Marker
                            key={index}
                            position={[marker.lat, marker.lng]}
                            icon={createNumberedIcon(index + 1)}
                        />
                    ))}
                </MapContainer>
            </div>

            <div className="button-container">
                <h3>Adicione ao menos 3 marcadores!</h3>
                <table className="marker-table">

                    <thead>
                    <tr>
                        <th>Marcador</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                    </tr>
                    </thead>
                    <tbody>
                    {markers.map((marker, index) => (
                        <tr key={index}>
                            <td>{`Marker ${index + 1}`}</td>
                            <td>{marker.lat.toFixed(6)}</td>
                            <td>{marker.lng.toFixed(6)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <button
                    className="send-button"
                    onClick={handleSendMarkers}
                    disabled={markers.length < 3 || isSending}
                >
                    {isSending ? 'Enviando...' : 'Enviar'}
                </button>
                <button className="clear-button" onClick={handleClearMarkers} disabled={isSending}>
                    Limpar
                </button>
            </div>

        </div>
    );
}

export default Mapa;
