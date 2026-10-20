import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';


function UploadTest() {
    const [url, setUrl] = useState('');

    return (
        <div className="page-container">
            <h1>Upload Test</h1>
            <ImageUpload onUploadSuccess={setUrl} />
            {url && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Uploaded:</h3>
                    <img src={'http://localhost:5001' + url} alt="uploaded" style={{ maxWidth: '300px'}} />
                </div>
            )}
        </div>
    );
}

export default UploadTest;