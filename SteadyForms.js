
//  1. Enter sheet name where data is to be written below
//  1. Enter sheet name and key where data is to be written below
        var SHEET_NAME = "DATA";
        var SHEET_KEY  = "1BSxHZp-n4JCFHDnrXPCkcfSgDiJnnpE_xO7kWG9_EnE";
                 
//  2. Run > setup
//
//  3. Publish > Deploy as web app 
//    - enter Project Version name and click 'Save New Version' 
//    - set security level and enable service (most likely execute as 'me' and access 'anyone, even anonymously) 
//
//  4. Copy the 'Current web app URL' and post this in your form/script action 
//
//  5. Insert column names on your destination sheet matching the parameter names of the data you are passing in (exactly matching case)

var SCRIPT_PROP = PropertiesService.getScriptProperties(); // new property service
 
// If you don't want to expose either GET or POST methods you can comment out the appropriate function
function doGet(e){
  return handleResponse(e);
}
 
function doPost(e){
  return handleResponse(e);
}
 
function doGet(e) { // change to doPost(e) if you are recieving POST data
  var ss = SpreadsheetApp.openById(ScriptProperties.getProperty('active'));
  var sheet = ss.getSheetByName("DATA");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; //read headers
  var nextRow = sheet.getLastRow(); // get next row
  var cell = sheet.getRange('a1');
  var col = 0;
  for (i in headers){ // loop through the headers and if a parameter name matches the header name insert the value
    if (headers[i] == "Timestamp"){
      val = new Date();
    } else {
      val = e.parameter[headers[i]]; 
function handleResponse(e) {
  // shortly after my original solution Google announced the LockService[1]
  // this prevents concurrent access overwritting data
  // [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
  // we want a public lock, one that locks for all invocations
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
  
  try {
     // next set where we write the data - you could write to multiple/alternate destinations
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var doc = SpreadsheetApp.openById("1BSxHZp-n4JCFHDnrXPCkcfSgDiJnnpE_xO7kWG9_EnE");
    var sheet = doc.getSheetByName("DATA");
     
     // we'll assume header is in row 1 but you can override with header_row in GET/POST data
    
    // we'll assume header is in row 1 but you can override with header_row in GET/POST data
    var headRow = e.parameter.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    var row = []; 
    // loop through the header columns
    for (i in headers){
      if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
        row.push(new Date());
      } else { // else use header name to get data
        row.push(e.parameter[headers[i]]);
      }
     }
    cell.offset(nextRow, col).setValue(val);
    col++;
  }
  //http://www.google.com/support/forum/p/apps-script/thread?tid=04d9d3d4922b8bfb&hl=en
  var app = UiApp.createApplication(); // included this part for debugging so you can see what data is coming in
  var panel = app.createVerticalPanel();
  for( p in e.parameters){
    panel.add(app.createLabel(p +" "+e.parameters[p]));
    // more efficient to set values as [][] array than individually
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    // return json success results
    return ContentService
          .createTextOutput(JSON.stringify({"result":"success", "row": nextRow}))
          .setMimeType(ContentService.MimeType.JSON);
  } catch(e){
    // if error return this
    return ContentService
          .createTextOutput(JSON.stringify({"result":"error", "error": e}))
          .setMimeType(ContentService.MimeType.JSON);
  } finally { //release lock
    lock.releaseLock();
  }
  app.add(panel);
  return app;
 }
//http://www.google.sc/support/forum/p/apps-script/thread?tid=345591f349a25cb4&hl=en
function setUp() {
  ScriptProperties.setProperty('active', SpreadsheetApp.getActiveSpreadsheet().getId());

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
 }
