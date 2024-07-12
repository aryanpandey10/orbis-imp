const axios = require('axios');
const xml2js = require('xml2js');
const express = require('express');
const app = express();

app.use(express.json());

const basketBooking = async (login, password, tradeReference, leadCustomer, guestDetails, propertyBookings) => {
    // Construct XML payload
    const xmlData = `
        <BasketBookRequest>
            <LoginDetails>
                <Login>${login}</Login>
                <Password>${password}</Password>
                <SellingCurrencyID>6</SellingCurrencyID>
                <SellingCountryID>72</SellingCountryID>
                <LanguageID>1</LanguageID>
            </LoginDetails>
            <TradeReference>${tradeReference}</TradeReference>
            <LeadCustomer>
                <CustomerTitle>${leadCustomer.customerTitle || 'Mr'}</CustomerTitle>
                <CustomerFirstName>${leadCustomer.customerFirstName}</CustomerFirstName>
                <CustomerLastName>${leadCustomer.customerLastName}</CustomerLastName>
                <DateOfBirth>${leadCustomer.dateOfBirth}</DateOfBirth>
                <CustomerAddress1>${leadCustomer.customerAddress1}</CustomerAddress1>
                <CustomerAddress2>${leadCustomer.customerAddress2 || ''}</CustomerAddress2>
                <CustomerTownCity>${leadCustomer.customerTownCity}</CustomerTownCity>
                <CustomerCounty>${leadCustomer.customerCounty}</CustomerCounty>
                <CustomerPostcode>${leadCustomer.customerPostcode}</CustomerPostcode>
                <CustomerBookingCountryID>${leadCustomer.customerBookingCountryID}</CustomerBookingCountryID>
                <CustomerPhone>${leadCustomer.customerPhone}</CustomerPhone>
                <CustomerMobile>${leadCustomer.customerMobile}</CustomerMobile>
                <CustomerFax>${leadCustomer.customerFax || ''}</CustomerFax>
                <CustomerEmail>${leadCustomer.customerEmail}</CustomerEmail>
                <CustomerPassportNumber>${leadCustomer.customerPassportNumber || ''}</CustomerPassportNumber>
            </LeadCustomer>
            <GuestDetails>
                ${guestDetails.map(guest => `
                    <GuestDetail>
                        <GuestID>${guest.id}</GuestID>
                        <Type>${guest.type || 'Adult'}</Type>
                        <Title>${guest.title || 'Mr'}</Title>
                        <FirstName>${guest.firstName}</FirstName>
                        <LastName>${guest.lastName}</LastName>
                        <Age>${guest.age}</Age>
                    </GuestDetail>`).join('\n')}
            </GuestDetails>
            <PropertyBookings>
                ${propertyBookings.map(property => `
                    <PropertyBookRequest>
                        <BookingToken>${property.bookingToken}</BookingToken>
                        <ArrivalDate>${property.arrivalDate}</ArrivalDate>
                        <Duration>${property.duration}</Duration>
                        <Request>${property.request || ""}</Request>
                        <ExpectedTotal>${property.expectedTotal}</ExpectedTotal>
                        <RoomBookings>
                            ${property.roomBookings.map(room => `
                                <RoomBooking>
                                    <RoomBookingToken>${room.roomBookingToken}</RoomBookingToken>
                                    <GuestIDs>
                                        ${room.guestIDs.map(id => `<GuestID>${id}</GuestID>`).join('\n') || `<GuestID>1</GuestID>`}
                                    </GuestIDs>
                                </RoomBooking>`).join('\n')}
                        </RoomBookings>
                    </PropertyBookRequest>`).join('\n')}
            </PropertyBookings>
        </BasketBookRequest>`;

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
        throw new Error('Failed to perform basket booking: ' + error.message);
    }
};

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

module.exports = basketBooking;