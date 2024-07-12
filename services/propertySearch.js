const axios = require('axios');
const xml2js = require('xml2js');

// Function to perform property search
async function propertySearch(login, password, arrivalDate, duration, propertyReferenceIDs, adults, children, childAges, infant) {
  const propertyIds = Array.isArray(propertyReferenceIDs) ? propertyReferenceIDs : [propertyReferenceIDs];
  const ages = Array.isArray(childAges) ? childAges : [childAges];
  
  // Construct XML payload
  const xmlData = `
    <PropertySearchRequest>
        <LoginDetails>
            <Login>${login}</Login>
            <Password>${password}</Password>
            <SellingCurrencyID>6</SellingCurrencyID>
            <SellingCountryID>72</SellingCountryID>
            <LanguageID>1</LanguageID>
        </LoginDetails>
        <ArrivalDate>${arrivalDate}</ArrivalDate>
        <Duration>${duration}</Duration>
        <PropertyReferenceIDs>
            ${propertyIds.map(id => `<PropertyReferenceID>${id}</PropertyReferenceID>`).join('\n')}
        </PropertyReferenceIDs>
        <RoomRequests>
            <RoomRequest>
                <GuestConfiguration>
                    <Adults>${adults}</Adults>
                    <Children>${children}</Children>
                    <ChildAges>
                        ${ages.map(age => `<ChildAge>${age}</ChildAge>`).join('\n')}
                    </ChildAges>
                    <Infant>${infant}</Infant>
                </GuestConfiguration>
            </RoomRequest>
        </RoomRequests>
    </PropertySearchRequest>`;

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
    throw new Error('Failed to perform property search: ' + error.message);
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

module.exports = propertySearch;
