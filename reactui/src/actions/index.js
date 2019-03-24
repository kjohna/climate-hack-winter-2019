import axios from 'axios';

export const GET_TEMPS = 'GET_TEMPS';
export const GET_ERROR = 'GET_ERROR'

/* eslint-disable no-console, semi-style */

axios.defaults.withCredentials = false;

// export const ROOT_URL =
//   (process.env.NODE_ENV === 'production') ?
//   'https://climate-hack-winter-2019.herokuapp.com/api'
//     : 'http://localhost:5000/api'
//   ;
// export const ROOT_URL = 'climate-hack-winter-2019.herokuapp.com'


let port, host, http;
if (process.env.NODE_ENV === 'production') {
  port = '';
  host = ''
  http = ''
} else {
  port = 5000;
  host = "localhost";
  http = 'http://'
}
export const authError = error => ({
  type: GET_ERROR,
  payload: error,
});

export const get_temps = (zip, history) => (dispatch) => {
  // console.log(`${http}://${host}:${port}/api/weather/${zip}`);
  // console.log(`in "get_temps" for ${JSON.stringify(zip, null, 2)}`);
  axios
    .get(`${http}${host}:${port}/api/weather/${zip}`)
    // .get(`:443/api/weather/${zip}`)
    .then((response) => {
      console.log(`in "get_temps" response for ${JSON.stringify(response, null, 2)}`);
      // let t = response.data.alert
      // let tc = t.replace(/\n/g,'<br/>')
      // console.log('tc',tc)
      // response.data.alert = tc;
      dispatch({
        type: GET_TEMPS,
        payload: response.data
      });
    })
    .catch((err) => {
      // console.log(`"get_temps" ${err}`);
      dispatch(authError('Failed to get_temps'));
    });
};

