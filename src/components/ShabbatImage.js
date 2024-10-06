import React from 'react';

function ShabbatImage({ imageSrc, text, setImageSrc, setText }) {
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result); // Update the image source with the new image
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle text change
  const handleTextClick = () => {
    const newText = prompt('Enter new text:', text);
    if (newText !== null) {
      setText(newText);
    }
  };

  return (
    <div className="shabbat-image">
      <label htmlFor="image-upload">
        <img
          src={imageSrc}
          alt="Shabbat"
         />
      </label>
      <input
        id="image-upload"
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Click on text to edit */}
      <p onClick={handleTextClick} >
        {text}
      </p>
    </div>
  );
}

export default ShabbatImage;
