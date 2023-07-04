import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [searchEngineId, setSearchEngineId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [numImages, setNumImages] = useState(0);

  const fetchImages = async startIndex => {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
      searchQuery
    )}&searchType=image&start=${startIndex}`;
    const response = await axios.get(searchUrl);
    return response.data;
  }

  const extractImageUrls = response => {
    const imageUrls = [];
    if (response && response.items) {
      response.items.forEach((item) => {
        if (item.link) {
          imageUrls.push(item.link);
        }
      });
    }
    return imageUrls;
  }

  const downloadImage = async (imageUrl, index) => {
    const imageResponse = await axios.get(imageUrl, { responseType: 'blob' });
    const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });
    const fileName = `${searchQuery.replace(/\s/g, '_')}_${index + 1}.jpg`;
    const link = document.createElement('a');

    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  const scrapeImages = async () => {
    try {
      let startIndex = 1;
      let totalImagesDownloaded = 0;

      while (totalImagesDownloaded < numImages) {
        const response = await fetchImages(startIndex);
        const imageUrls = extractImageUrls(response);

        if (imageUrls.length === 0) {
          console.log('No more images found.');
          break;
        }

        const remainingImagesToDownload = numImages - totalImagesDownloaded;
        const limitedImageUrls = imageUrls.slice(0, remainingImagesToDownload);

        for (let i = 0; i < limitedImageUrls.length; i++) {
          await downloadImage(limitedImageUrls[i], totalImagesDownloaded + i);
          console.log(`Downloaded image ${totalImagesDownloaded + i + 1}/${numImages}`);
        }

        totalImagesDownloaded += limitedImageUrls.length;
        startIndex += limitedImageUrls.length;
      }

      console.log('Scraping completed!');
    } catch (error) {
      console.error('An error occurred during scraping:', error);
    }
  }

  return (
    <div>
      <h2>
        Query:
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        Num:
        <input type="number" value={numImages} onChange={(e) => setNumImages(parseInt(e.target.value, 10))} />
      </h2>
      <h2>
        API Key:
        <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      </h2>
      <h2>
        Search Engine ID:
        <input type="text" value={searchEngineId} onChange={(e) => setSearchEngineId(e.target.value)} />
      </h2>
      <div>Scraping Images...</div>
      <button onClick={scrapeImages}>SCRAP!</button>
    </div>
  );
};

export default App;
