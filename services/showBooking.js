const axios = require('axios');
const xml2js = require('xml2js');

// Function to perform property pre-book
async function showBooking() {
  // Construct XML payload
  const xmlData = `<SearchBookingsRequest>
    <LoginDetails>
        <Login>OrbisTechnomineTest</Login>
        <Password>Techn0m1n3Test#24</Password>
        <SellingCurrencyID>6</SellingCurrencyID>
        <SellingCountryID>72</SellingCountryID>
        <LanguageID>1</LanguageID>
    </LoginDetails>
    <BookingReference />
    <TradeReference>OBS1802</TradeReference>
</SearchBookingsRequest>`;

  // Set up Axios request configuration
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://imperatorestagingweb.ivectorconnect.co.uk/ivectorconnect.ashx',
    headers: { 
      'Content-Type': 'text/xml'
    },
    data: xmlData
  };

  try {
    // Make the API request
    const response = await axios(config);
    // Convert XML response to JSON
    const jsonResult = await xmlToJson(response.data);
    // Return the JSON result
    return jsonResult;
  } catch (error) {
    // Throw error if request fails
    throw new Error('Failed to perform property pre-book: ' + error.message);
  }
}

// Utility function to convert XML to JSON
function xmlToJson(xml) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = showBooking;
