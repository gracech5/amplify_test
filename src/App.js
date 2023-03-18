import { useRef, useState, useEffect } from 'react'
import { Storage } from 'aws-amplify'
import './App.css';
import { Camera } from "react-camera-pro";

function App() {
  const [images, setImages] = useState([]);
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);
  const [nutri, setNutri] = useState("a");

  useEffect(() => {
    fetchImages()
  }, [])
  async function fetchImages() {
    let imageKeys = await Storage.list('')
    imageKeys = await Promise.all(imageKeys.map(async k => {
      const key = await Storage.get(k.key)
      return key
    }))
    console.log('imageKeys: ', imageKeys)
    setImages(imageKeys)
  }
  async function onChange(e) {
    const file = e.target.files[0];
    const result = await Storage.put(file.name, file, {
      contentType: 'image/png'
    })
    console.log({ result })
    fetchImages()
  }

  async function uploadImageToS3(image) {
    const fileName = `testing_${new Date().getTime()}.jpeg`;
  
    try {
      const result = await Storage.put(fileName, image, {
        contentType: 'image/jpeg'
      });
  
      console.log('Uploaded file: ', result);
  
      return result.key;
    } catch (error) {
      console.error('Error uploading file: ', error);
    }
  }

  return (
    <div className="App">

      <h1>Camera</h1>

      <div>
        <Camera ref={camera} aspectRatio={16 / 9} className="camera"/>
        <button onClick={() => {const photo = camera.current.takePhoto();
        setImage(photo)}}>Take photo</button>
        <img src={image} alt='Taken photo'/>
      </div>


      <h1>Confirm Photo</h1>
      <button onClick={() => {uploadImageToS3(image); console.log(
              JSON.stringify({ b64: image })
            ) }}>Upload to S3</button>

      <h1>Upload existing Photo</h1>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {
          images.map(image => (
            <img
              src={image}
              key={image}
              style={{width: 500, height: 300}}
            />
          ))
        }
      </div>
      <input
        type="file"
        onChange={onChange}
      />
    </div>
  );
}

export default App;