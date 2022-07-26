/*
const images ={
  appLogo: require('./nLogo.png').default
}
export default images;
*/


function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item).default; });
  return images;
}

const images = importAll(require.context('../img', false, /\.(png|jpe?g|svg|PNG)$/));

export default images;
