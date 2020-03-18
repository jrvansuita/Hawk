


const ImageSaver = require('./app/image/image-saver.js');
const ImageHandler = require('./app/image/image-handler.js');

const Initilizer = require('./app/abra-cadabra/initializer.js');
new Initilizer(__dirname, true).begin(() => {


  var data =  "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACMUlEQVRoge2Yv2tTURTHP+eliTGIgq4VIooKQnF2MrUiSNvJWMQ9oOLsYIaAPybBwSmLf0BHU2hF7CJUcOrgItRB0k2ziBrrS95x6JOUkOS93HeTCLkfCHnce+4955vcb3LeA4fD4QAorhZTcWMrq8XMMPGD8GxsUq7Nb53NNXYevFk4FhVb2bh23M81Pp073HhnI7cVAYCKkk//bj+JCmz5/gtR8kDTRuIZG5sEcN+DDyB3Hq4VRFQuAKeBE2FIA/gMfAVuAM02wT0bua0IyATBdz/" +
   "l1UXJi8rdHiGz4QsAUf2SmvF8G7kTH6HyWmG55Xnb4bGIhYqcp812+dWVxaT5Jcnicm3hMgSvgUw4tBW+X+qzpHt+T0SuPlp8a2xoYwGV2lKuxY+PIKf+jf0J9o6m2tlMKq3feq3pNa+w86vZnHt+872RqY090OLn7YPFA6Ql+0zSwaF+n0uveYEzR3LZW8BLkzqMBSisdJcpoqVBX2q/eVVZwVCAsYkF5kzX9uCixb0cYyXyV6hcK1wHqQIESunp8ub6/vi82izk8dKmDMrXjxgekCrhP6knWk1eqt18cUw827mUk8Z1xWeofLa60YnhBEwaJ2DSOAGTZioE7HYutT6ySgzzRQoIlNL+RlrH80rJaotm2HzGt5SjauaGZSo80I/d6JC4mHvLWEDnrCYlmbcSPRc6SLcnus901LwpU+2B/wInYNLYFBDVAoykJbEmIKoFGHdL4nA4HOPhL7qsvM+b6M5oAAAAAElFTkSuQmCC";

  new ImageHandler()
  .setQuality(60)
  .setWidth(300)
  .setScale(2)
  .setBase64Image(data)
  .process();





});
