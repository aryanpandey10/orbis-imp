const axios = require('axios');
const xml2js = require('xml2js');

// Function to perform property booking
async function propertyBook(login, password, bookingToken, arrivalDate, duration, propertyReferenceID, roomBookings) {
  // Construct XML payload
  const xmlData = `
    <PropertyPreBookRequest>
        <LoginDetails>
            <Login>${login}</Login>
            <Password>${password}</Password>
            <SellingCurrencyID>6</SellingCurrencyID>
            <SellingCountryID>72</SellingCountryID>
            <LanguageID>1</LanguageID>
        </LoginDetails>
        <BookingToken>${bookingToken}</BookingToken>
        <ArrivalDate>${arrivalDate}</ArrivalDate>
        <Duration>${duration}</Duration>
        <PropertyReferenceID>${propertyReferenceID}</PropertyReferenceID>
        <RoomBookings>
            ${roomBookings.map(room => `
              <RoomBooking>
                  <RoomBookingToken>${room.roomBookingToken}</RoomBookingToken>
                  <GuestConfiguration>
                      <Adults>${room.adults}</Adults>
                      <Children>${room.children || 0}</Children>
                      <ChildAges>
                        <ChildAge>${room.childAges || 0}</ChildAge>
                      </ChildAges>
                      <Infant>${room.infant || 0}</Infant>
                  </GuestConfiguration>
              </RoomBooking>`).join('\n')}
        </RoomBookings>
    </PropertyPreBookRequest>`;

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
    throw new Error('Failed to perform property booking: ' + error.message);
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

module.exports = propertyBook;
