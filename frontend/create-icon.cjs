const { Jimp } = require('jimp');
const path = require('path');

async function createIcon() {
  try {
    // Path to original logo
    const logoPath = path.join(__dirname, 'public', 'saka.png');
    // Path to output logo
    const outputPath = path.join(__dirname, 'public', 'saka-padded.png');

    // Create a new pure white 512x512 canvas
    const canvas = new Jimp({ width: 512, height: 512, color: 0xffffffff });

    // Read the original logo
    const logo = await Jimp.read(logoPath);

    // Make the logo fit exactly within a 340x340 box (leaving plenty of padding)
    logo.scaleToFit({ w: 340, h: 340 });

    // Calculate x and y to center the logo perfectly
    const x = (512 - logo.bitmap.width) / 2;
    const y = (512 - logo.bitmap.height) / 2;

    // Composite (paste) the logo onto the white canvas
    canvas.composite(logo, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });

    // Save the new perfect icon
    await canvas.write(outputPath);
    console.log('Icon generated successfully at:', outputPath);
  } catch (error) {
    console.error('Error creating icon:', error);
  }
}

createIcon();
