import React, { useState } from 'react';
import { uploadImage } from '../services/api';

function ImageUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [msg,setMsg] = useState('');

    
    function pickFile(e) {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setMsg('');
        }
    }

    async function doUpload() {
        if (!file) {
            setMsg('Please pick a file');
            return;
        }
        setMsg('Uploading...');
        try {
            const data = await uploadImage(file);
            setMsg('Success!');
            if(onUploadSuccess) {
                onUploadSuccess(data.url);
            }
        } catch (error) {
            setMsg('Error: ' + error.message);
        }

    }

    return (
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '10px'}}>
            <h3>Upload Image</h3>
            <input type="file" accept="image/*" onChange={pickFile} />
            {preview &&(
                <img
                    src={preview}
                    alt="preview"
                    style={{ maxwidth: '200px', display: 'block', marginTop: '10px' }}
                />
            )}
            <button onClick={doUpload} style={{ marginTop: '10px'}}>Upload</button>
            {msg && <p>{msg}</p>}
        </div>
    );
}

export default ImageUpload;