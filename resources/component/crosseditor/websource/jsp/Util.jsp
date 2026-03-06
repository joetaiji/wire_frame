<%@page import="java.util.*"%>
<%@page import="java.io.*"%>
<%@page import="java.net.*"%>
<%@page import ="javax.xml.parsers.DocumentBuilder"%>
<%@page import ="javax.xml.parsers.ParserConfigurationException"%>
<%@page import ="javax.xml.parsers.DocumentBuilderFactory"%>
<%@page import ="org.xml.sax.SAXException"%>
<%@page import ="org.w3c.dom.Document"%>
<%@page import ="org.w3c.dom.Element"%>
<%@page import ="org.w3c.dom.Node"%>
<%@page import ="org.w3c.dom.NodeList"%>
<%@page import ="org.xml.sax.SAXParseException"%>
<%@page import="java.security.SecureRandom"%>
<%@page import ="org.apache.commons.codec.binary.Base64"%>
<%!
public boolean isImageValid(String typeCheck,String fileCheck )
{
	String appExtensions ="";
	
	boolean value = false;

	typeCheck = typeCheck.toUpperCase();
	fileCheck = fileCheck.toUpperCase();
	  
	if(typeCheck.equalsIgnoreCase("FLASH"))
	{
		appExtensions = "SWF,WMV,AVI,MP4,OGG,WEBM";
	}
	else if(typeCheck.equalsIgnoreCase("FILE"))
	{
		appExtensions = "ZIP,DOC,DOCX,XLS,XLSX,TXT,PDF";
	}
	else
	{
		appExtensions = "GIF,JPEG,JPG,PNG,BMP";
	}
	
	String app[] =  appExtensions.split(",");

	for(int i=0;i<app.length;i++)
	{
		if(app[i].equalsIgnoreCase(fileCheck)){value = true;}
	}
	
	return value;
}
  
public String getImageKind(String typeCheck)
{
	typeCheck = typeCheck.toUpperCase();

	if(typeCheck.equalsIgnoreCase("FLASH"))
	{
		return "swf, wmv, avi, mp4, ogg, webm";	
	}
	else if(typeCheck.equalsIgnoreCase("FILE"))
	{
		return "zip, doc, docx, xls, xlsx, txt, pdf";
	}
	else
	{
		return "gif, jpeg, jpg, png, bmp";
	}
}

public boolean isArray(String appExtensions, String fileCheck)
{
	String app[] =  appExtensions.split(",");
	boolean value = false;

	for (int i=0;i<app.length;i++) {
		if(app[i].equalsIgnoreCase(fileCheck)){value = true;}
	}
	
	return value;
}

public String getChildDirectory(String path, String maxCount)
{
	
	if(maxCount.equalsIgnoreCase("")){maxCount = "100";}
	
	boolean childFlag = false;
	int childNum = 0;
	String childName = "";
	int fileInt = 0;
	
	File dir = new File(path);
	if(!dir.exists()){return childName = "";}
	int listLength = 0;
	if (dir != null && dir.list() != null) {
		listLength = dir.list().length;
	}
	
	for(int i=0;i<listLength;i++)
	{
		File tmpFile = new File(path + File.separator + dir.list()[i]);
		try{
			if(tmpFile.isDirectory())
			{
				fileInt =  Integer.parseInt(tmpFile.getName());
				childFlag = true;
				if(fileInt > childNum)
				{		
					childNum = fileInt;
					childName = tmpFile.getName();
				}
			}
		}
		catch(NumberFormatException e)
		{
			// 디렉토리명이 숫자가 아닌 경우 로그 기록 후 건너뛰기
			System.out.println("[Util.jsp] 디렉토리명 숫자 변환 실패: " + tmpFile.getName() + " - " + e.getMessage());
			continue;
		}
	}

	if(!childFlag)
	{
		childNum++;
		childName = "000000" + Integer.toString(childNum);
		childName = childName.substring(childName.length() - 6);
		File dirNew = new File(path+File.separator+childName);
		if(!dirNew.exists()){
			dirNew.setExecutable(false, true);
			dirNew.setReadable(true);
			dirNew.setWritable(false, true);

			boolean returnRes = dirNew.mkdir();
			if(returnRes == false){
				return "";
			}
		}
	}

	String childPath = path + File.separator + childName;
	
	File dir3 = new File(childPath);
	int cCount = 0;
	if (dir3 != null && dir3.list() != null) {
		listLength = dir3.list().length;
	}
	for(int i=0;i<listLength;i++)
	{
		File tmpFiles = new File(childPath+File.separator+dir3.list()[i]);
		if(tmpFiles.isFile())
		{
			cCount++;
		}
	}
	if(cCount >= Integer.parseInt(maxCount))
	{
		childNum++;
		if(Integer.toString(childNum).length() > 6){
			childName = Integer.toString(childNum);
		}else{
			childName = "000000" + Integer.toString(childNum);
			childName = childName.substring(childName.length() - 6);
		}
		
		File dir4 = new File(path+File.separator+childName);
		if(!dir4.exists()){
			dir4.setExecutable(false, true);
			dir4.setReadable(true);
			dir4.setWritable(false, true);

			boolean returnRes = dir4.mkdir();
			if(returnRes == false){
				return "";
			}
		}
	}
	return childName;
}

public String checkFileUniqueName(String realFileName, String image_physical_path ,String fileCheck)
{
	String strFileName = realFileName + "." + fileCheck;
	boolean due_check = true;
	String strFileWholePath = image_physical_path + File.separator + strFileName;
	int due_File_Count = 0;

	while(due_check)
	{
		if(new File(strFileWholePath).exists())
		{
			due_File_Count += 1;
			strFileName = realFileName + "_" + due_File_Count + "." + fileCheck;
			strFileWholePath = image_physical_path + File.separator + strFileName;
		}
		else
		{
			due_check = false;
		}
	}
	return strFileName;
}

public synchronized int fileCopy(String path, String savePath)
{
	int check = 0; 

	FileInputStream inputStream = null;
	FileOutputStream outputStream = null;
	BufferedInputStream bin = null;
	BufferedOutputStream bout = null;
	
	try{
		if(path != null){
			inputStream = new FileInputStream(path);         
		}else{
			return check;
		}  
		if(savePath != null){
			outputStream = new FileOutputStream(savePath);       
		}else{
			return check;
		}

		bin = new BufferedInputStream(inputStream);
		bout = new BufferedOutputStream(outputStream);

		int bytesRead = 0;
		byte[] buffer = new byte[1024];

		while ((bytesRead = bin.read(buffer, 0, 1024)) != -1) {
			bout.write(buffer, 0, bytesRead);
		}
		check = 1;
	}
	catch(IOException ioe)
	{
		check = 0;
	}
	finally
	{
		try
		{
			if(bout != null){
				bout.close();
			}
			if(bin != null){
				bin.close();
			}
			if(outputStream != null){
				outputStream.close();
			}
			if(inputStream != null){
				inputStream.close();
			}
		}
		catch(IOException e)
		{
			//System.out.println("1:An internal exception occured!");
		}
	}
	return check;
}

public String getEditorAuth(String filename, String conn, String conval)
{
	String result = "false";
	String str = "";
	HttpURLConnection con = null;
	InputStreamReader reader = null;
	BufferedReader br = null;

	try
	{
		URL url = new URL(filename);
		con = (HttpURLConnection)url.openConnection();
		reader = new InputStreamReader(con.getInputStream());

		br = new BufferedReader(reader);
		char[] buffer = new char[1024];
				
//		String data = "";
//		while((data=br.readLine()) != null ){
//			str += data;
//		}

		int returnRes = br.read(buffer,0,1024);

//		for (char c : buffer)
//        {
//			if(c != (char)0)
//            {
//               str += c;
//            }
//        }
//       }
		
		if(returnRes > 0){
			for (int i=0; buffer.length>i; i++)
			{
				if(buffer[i] != (char)0)
				{
				   str += buffer[i];
				}
			}
		}

		if (str.equalsIgnoreCase("valid")){
			result = "true";
		}else if (str.equalsIgnoreCase("expire_invalid")){
			result = "expire";
		}else{
			result = "false";
		}
	}
	catch(IOException e)
	{	
		result = "false";
		//System.out.println("2:An internal exception occured!");
	}
	finally
	{
		try
		{
			if(br != null){
				br.close();
			}
			if(reader != null){
				reader.close();
			}
			if(con != null){
				con.disconnect();
			}	
		}
		catch(IOException e)
		{
			result = "false";
			//System.out.println("3:An internal exception occured!");
		}
	}
	return result;
}

public String createEncodeEditorKey(String genkey)
{
	//sun.misc.BASE64Encoder encoder = new sun.misc.BASE64Encoder();
	//byte[] keyByte = genkey.getBytes();
	//String base64_encodeText = encoder.encode(keyByte);
	//라이브러리 추가 요함 -> https://commons.apache.org/proper/commons-codec/download_codec.cgi
	try{
		byte[] encoded = Base64.encodeBase64(genkey.getBytes());
		String base64_encodeText = new String(encoded, "ISO-8859-1");
		
		int str_length = base64_encodeText.length();
		String strLeft = base64_encodeText.substring(0,str_length/2);
		String strRight = base64_encodeText.substring(str_length/2,str_length);

		int strLeft_length = strLeft.length();
		String strLeftSubLeft = strLeft.substring(0,strLeft_length/2);
		String strLeftSubRight = strLeft.substring(strLeft_length/2,strLeft_length);

		int strRight_length = strRight.length();
		String strRightSubLeft = strRight.substring(0,strRight_length/2);
		String strRightSubRight = strRight.substring(strRight_length/2,strRight_length);
		
		genkey = strLeftSubLeft + strRightSubLeft + strRightSubRight + strLeftSubRight;

		
	}catch(UnsupportedEncodingException e){
		genkey = "EncodingException";
	}

	return genkey;
}

public long getDateDiff(String targetDate)
{
	long dateDiff = 1;

	//try{
		Calendar gCal = Calendar.getInstance();
		gCal.setTime(new Date());
		int cur_year = gCal.get(Calendar.YEAR);
		int cur_month = gCal.get(Calendar.MONTH)+1;
		int cur_day = gCal.get(Calendar.DATE);
		
		String[] exp_arr = targetDate.split("-");
		int target_year = Integer.parseInt(exp_arr[0]);
		int target_month = Integer.parseInt(exp_arr[1]);
		int target_day = Integer.parseInt(exp_arr[2]);

		Calendar ca1 = Calendar.getInstance();
        Calendar ca2 = Calendar.getInstance();

        ca1.set(target_year, target_month, target_day);
        ca2.set(cur_year, cur_month, cur_day);

        long milisecond1 = ca1.getTimeInMillis();
        long milisecond2 = ca2.getTimeInMillis();

        long diffInMSec = milisecond2 - milisecond1;

        dateDiff = diffInMSec / (24 * 60 * 60 * 1000);
	//}catch(Exception e){
		//System.out.println("4:An internal exception occured!");
	//	dateDiff = -1;
	//}

	return dateDiff;
}

public String executeFileScript(HttpServletResponse response, String result, String addmsg, String useExternalServer, String userDomain, String image_editor_flag, String checkPlugin)
{
	String param = "";
	String result_sc = "";

	userDomain = userDomain.trim();
	if (!userDomain.equalsIgnoreCase(""))
		userDomain = "document.domain=\"" + userDomain + "\";";
	else
		userDomain = "";

	if (image_editor_flag.equalsIgnoreCase("flashPhoto")) {
		param = "{";
		param += "\"result\":\"" + result + "\",";
		param += "\"imageURL\":\"\",";
		param += "\"addmsg\":\"" + addmsg + "\"";
		param += "}";

		result_sc = param; 
	} else {
		if(checkPlugin.equalsIgnoreCase("false")) {
			// 20141118 image drag&drop event
			if (addmsg != null) {
				param = "{";
				param += "\"result\":\"" + result + "\",";
				if (result.equalsIgnoreCase("virus") || "UploadFileExtBlock".equalsIgnoreCase(result)) {
					param += "\"addmsg\":\"" + addmsg + "\"";
				} else {
					if(result.equalsIgnoreCase("success")){
						// [4.0.0.22] json.parse 오류 수정
						param += "\"addmsg\":[" + addmsg + "]";
					}else{
						// [4.0.0.22] json.parse 오류 수정
						param += "\"addmsg\":\"[" + addmsg + "]\"";
					}
				}
				param += "}";
			} else {
				param = "{";
				param += "\"result\":\"" + result + "\"";
				param += "}";
			}
		} else {
			if (addmsg != null)
				param = "'" + result + "','" + addmsg + "'";
			else
				param = "'" + result + "'";
		}
		
		//2018-11-20[4.2.0.12]보안취약점 불필요한 코드 주석
		result_sc = param;
		/*
		if (checkPlugin.equalsIgnoreCase("false")) {
			// 20141118 image drag&drop event
			result_sc = param;
		} else if (!useExternalServer.equalsIgnoreCase("")) {
			try {
				result_sc = "?userdomain=" + URLEncoder.encode(userDomain, "utf-8");
				result_sc += "&funcname=" + URLEncoder.encode("setInsertFile", "utf-8");
				result_sc += "&param=" + URLEncoder.encode(param, "utf-8");

				response.sendRedirect(useExternalServer + result_sc);
				return "";
			} catch (IOException e) {
				//System.out.println("5:An internal exception occured!");
			}
		} else {
			result_sc = "<script language='javascript' type='text/javascript'>";
			result_sc += userDomain;
			result_sc += " parent.window.setInsertFile(" + param + ");</script>";
		}
		*/
		result_sc = param;
	}

	return result_sc;
}

public String executeScript(HttpServletResponse response, String result, String addmsg, String useExternalServer, String userDomain, String image_editor_flag, String checkPlugin)
{
	String param = "";
	String result_sc = "";

	userDomain = userDomain.trim();
	if (!userDomain.equalsIgnoreCase(""))
		userDomain = "document.domain=\"" + userDomain + "\";";
	else
		userDomain = "";

	if (image_editor_flag.equalsIgnoreCase("flashPhoto")) {
		param = "{";
		param += "\"result\":\"" + result + "\",";
		param += "\"imageURL\":\"\",";
		param += "\"addmsg\":\"" + addmsg + "\"";
		param += "}";

		result_sc = param; 
	} else {
		
		if(checkPlugin.equalsIgnoreCase("false")) {
			// 20141118 image drag&drop event
			if (addmsg != null) {
				param = "{";
				param += "\"result\":\"" + result + "\",";
				if (result.equalsIgnoreCase("virus")) {
					param += "\"addmsg\":\"" + addmsg + "\"";
				} else {
					if(result.equalsIgnoreCase("success")){
						param += "\"addmsg\":[" + addmsg + "]";
					}else{
						param += "\"addmsg\":\"[" + addmsg + "]\"";
					}
				}

				param += "}";
			} else {
				param = "{";
				param += "\"result\":\"" + result + "\"";
				param += "}";
			}
		} else {
			if (addmsg != null)
				param = "'" + result + "','" + addmsg + "'";
			else
				param = "'" + result + "'";
		}

		//2018-11-20[4.2.0.12]보안취약점 불필요한 코드 주석
		result_sc = param;
		/*
		if (checkPlugin.equalsIgnoreCase("false")) {
			// 20141118 image drag&drop event
			result_sc = param;
		} else if(!useExternalServer.equalsIgnoreCase("")) {	
			try {
				result_sc = "?userdomain=" + URLEncoder.encode(userDomain, "utf-8");
				result_sc += "&funcname=" + URLEncoder.encode("setInsertImageFile", "utf-8");
				result_sc += "&param=" + URLEncoder.encode(param, "utf-8");
				response.setHeader("Access-Control-Allow-Origin", "*"); 
				response.sendRedirect(useExternalServer + result_sc);
				return "";
			} catch (IOException e) {
				//System.out.println("6:An internal exception occured!");
			}
		} else {
			result_sc = "<script language='javascript' type='text/javascript'>";
			result_sc += userDomain;
			result_sc += " parent.window.setInsertImageFile(" + param + ");</script>";
		}
		*/
	}

	return result_sc;
}


public String dompaser(String image_temp)
{
	String imageUrl = image_temp;
	String oContextPath = "";
	String oDocPath = "";
	String oPhygicalPath = "";
	String pathValue = "";

	try {
		if (System.getProperty("catalina.home") != null){

			String filenames=System.getProperty("catalina.home") + "/conf/server.xml";
			File severXml = new File(filenames);
			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

			//2016-06-07 보안취약성처리
			/*
			dbf.setValidating(true);
			dbf.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
			dbf.setFeature("http://xml.org/sax/features/external-general-entities",false);
			dbf.setFeature("http://xml.org/sax/features/external-parameter-entities",false);
			dbf.setFeature("http://xml.org/sax/features/validation", true);
			*/
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document doc = db.parse(severXml);
			
			NodeList nodeLst = doc.getElementsByTagName("Context");
					
			for(int i = 0; i<nodeLst.getLength(); i++)
			{
				pathValue = ((Element)nodeLst.item(i)).getAttribute("path");
				
				//try{
					if (pathValue.equalsIgnoreCase(imageUrl.substring(0,pathValue.length())))
					{
						if(pathValue.length() > oContextPath.length())
						{
							oContextPath = pathValue;
							oDocPath = ((Element)nodeLst.item(i)).getAttribute("docBase");
							
							if(pathValue.lastIndexOf("/") == pathValue.length()-1)
							{
								pathValue = pathValue.substring(0,pathValue.lastIndexOf("/"));
							}
							
							oPhygicalPath = oDocPath;
							String pathArr[] = imageUrl.substring(pathValue.length()).split("/");
							for (int t = 0; t < pathArr.length; t++){
								if (!pathArr[t].equalsIgnoreCase("")){
									oPhygicalPath += File.separator + pathArr[t];
								}
							}
						}
					}
				//} catch(Exception e2) {
				//	oPhygicalPath = "";
					//continue;
					//System.out.println("7:An internal exception occured!");
				//}
			}
		}
	} catch (ParserConfigurationException  e) {
		oPhygicalPath = "";
		//System.out.println("8:An internal exception occured!");
	}catch (IOException  e) {
		oPhygicalPath = "";
		//System.out.println("9:An internal exception occured!");
	}catch (SAXException  e) {
		oPhygicalPath = "";
		//System.out.println("10:An internal exception occured!");
	}

	return oPhygicalPath;
}

public String mediaMimeType(String fileExt) {
		
	String returnValue = "";
	String defaultType = "noContents";
	String flashType = "application/x-shockwave-flash";	
	String quicktimeType = "video/quicktime";			
	String asfType = "video/x-ms-asf";					
	String mpegType = "audio/mpeg";						
	String midType = "audio/x-midi";					
	String rmType = "application/vnd.rn-realmedia";		
	String wavType = "audio/x-wav";						
	String dcrType = "application/x-director";			
	String flvType = "video/x-flv";	
	
	String wmvType = "video/x-ms-wmv";
	String aviType = "video/x-msvideo";
	String mp4Type = "video/mp4";
	String oggType = "video/ogg";
	String webmType = "video/webm";

	fileExt = fileExt.toUpperCase();

	if (fileExt.equalsIgnoreCase("MOV")) {
		returnValue = quicktimeType;
	}
	else if (fileExt.equalsIgnoreCase("WAV")) {
		returnValue = wavType;
	}
	else if (fileExt.equalsIgnoreCase("SWF")) {
		returnValue = flashType;
	}
	else if (fileExt.equalsIgnoreCase("FLV")) {
		returnValue = flvType;
	}
	else if (fileExt.equalsIgnoreCase("DCR")) {
		returnValue = dcrType;
	}
	else if (fileExt.equalsIgnoreCase("ASF")) {
		returnValue = asfType;
	}
	else if (fileExt.equalsIgnoreCase("ASX")) {
		returnValue = asfType;
	}
	else if (fileExt.equalsIgnoreCase("MP2")) {
		returnValue = mpegType ;
	}
	else if (fileExt.equalsIgnoreCase("MP3")) {
		returnValue = mpegType ;
	}
	else if (fileExt.equalsIgnoreCase("MPGA")) {
		returnValue = mpegType;
	}
	else if (fileExt.equalsIgnoreCase("MID")) {
		returnValue = midType;
	}
	else if (fileExt.equalsIgnoreCase("MIDI")) {
		returnValue = midType;
	}
	else if (fileExt.equalsIgnoreCase("RM")) {
		returnValue = rmType;
	}
	else if (fileExt.equalsIgnoreCase("RAM")) {
		returnValue = rmType;
	}
	else if (fileExt.equalsIgnoreCase("WMV")) {
		returnValue = wmvType;
	}
	else if (fileExt.equalsIgnoreCase("AVI")) {
		returnValue = aviType;
	}
	else if (fileExt.equalsIgnoreCase("MP4")) {
		returnValue = mp4Type;
	}
	else if (fileExt.equalsIgnoreCase("OGG")) {
		returnValue = oggType;
	}
	else if (fileExt.equalsIgnoreCase("WEBM")) {
		returnValue = webmType;
	}
	else {
		returnValue = defaultType;
	}


	return returnValue;
}

public int getRandomSeed(String div, String cpath)
{
	
	int returnVal = 0;
	String url1 = xmlUrl1(cpath);
	Element root1 = configXMlLoad1(url1);
	Hashtable settingValue = childValueList1(root1);
	returnVal = Integer.parseInt(settingValue.get(div).toString());

	return returnVal;
}

public String rootFolderPath1(String urlPath)
{
	String fileRealFolder = "";
	fileRealFolder = urlPath.substring(0, urlPath.lastIndexOf("/") + 1);

	return fileRealFolder;
}

public String xmlUrl1(String urlPPath)
{
	return  urlPPath + File.separator +  "config" + File.separator + "xmls" + File.separator + "Config.xml";
}

//xml data load
public static Element configXMlLoad1(String configValue)
{
	File severXml = new File(configValue);
	Element root = null;
	Document doc = null;
	try{
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		
		//2016-06-07 보안취약성처리
		/*
		dbf.setValidating(true);
		dbf.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
		dbf.setFeature("http://xml.org/sax/features/external-general-entities",false);
		dbf.setFeature("http://xml.org/sax/features/external-parameter-entities",false);
		dbf.setFeature("http://xml.org/sax/features/validation", true);
		*/
		DocumentBuilder db = dbf.newDocumentBuilder();
		doc = db.parse(severXml);
		root = doc.getDocumentElement();
		root.normalize();
		return root;
	}catch (SAXParseException err) {
		//System.out.println("internal exception occured!");
		root = null;
	} catch (SAXException e) {
		//System.out.println("internal exception occured!");
		root = null;
	} catch (java.net.MalformedURLException mfx) {
		//System.out.println("internal exception occured!");
		root = null;
	} catch (java.io.IOException e) {
		//System.out.println("internal exception occured!");
		root = null;
	} catch (Exception pce) {
		//System.out.println("internal exception occured!");
		root = null;
	}
	return root;
}

public Hashtable childValueList1(Element root)
{
	Hashtable settingValue = new Hashtable();
	List addMenuList = new ArrayList();
	
	NodeList nodeList = root.getChildNodes();
	Node node;
	Node cNode;
	NodeList childNodes;
	settingValue.put("AddMenuCheck", "false");
	
	/*
	try{
	*/
			for(int i=0; i<nodeList.getLength(); i++){
				
				node = nodeList.item(i);
				if(node.getNodeType() == Node.ELEMENT_NODE){
					
					childNodes = node.getChildNodes();
					for(int j=0; j<childNodes.getLength();j++){
						
						cNode = childNodes.item(j);
						if(cNode.getNodeType() == Node.ELEMENT_NODE){
							
							if(cNode.getNodeName().equalsIgnoreCase("AddMenu")) settingValue.put("AddMenuCheck", "true");
							
							if(cNode.getFirstChild() != null){
								if(cNode.getNodeName().equalsIgnoreCase("AddMenu")){
									addMenuList.add(cNode.getFirstChild().getNodeValue());
									settingValue.put(cNode.getNodeName(),addMenuList);	
								}
								else {
									settingValue.put(cNode.getNodeName(),cNode.getFirstChild().getNodeValue());
								}
							}
							else{
								if(cNode.getNodeName().equalsIgnoreCase("AddMenu")){
									addMenuList.add("");
									settingValue.put(cNode.getNodeName(),addMenuList);	
								}else{
									settingValue.put(cNode.getNodeName(),"");
								}
							}
						}
					}
				}
			}
			
			return settingValue;
	/*
	} catch (Exception pce) {
			System.out.println("internal exception occured!");
			return settingValue;
	}
	*/
}

// filename is Time 
public String fileNameTimeSetting()
{
	String fileNameTime = "";
	Calendar oCalendar = Calendar.getInstance();
	
	StringBuffer buffer = new StringBuffer();
    SecureRandom random = new SecureRandom();
	String randomValue = "";
	String chars[] = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9".split(",");
	int count = 8;
	for(int i=0; i<count; i++) {
		// buffer.append(chars[random.nextInt(chars.length)]);
		// buffer.append(chars[random.nextInt(getRandomSeed("randomfilename", path))]);
		int ranVal = random.nextInt();
		if(ranVal < 0){
			ranVal = (ranVal * -1);
		}
		ranVal = (ranVal % chars.length);
		buffer.append(chars[ranVal]);
    }
	randomValue = buffer.toString();
	
	// YYYYMMDDhhmmssxxx_rendom(int+Char)
	String oYear = Integer.toString(oCalendar.get(Calendar.YEAR));
	String oMonth = "0" + Integer.toString(oCalendar.get(Calendar.MONTH) + 1);
	String oDay = "0" + Integer.toString(oCalendar.get(Calendar.DAY_OF_MONTH));
	String oHour = "0" + Integer.toString(oCalendar.get(Calendar.HOUR_OF_DAY));
	String oMin = "0" + Integer.toString(oCalendar.get(Calendar.MINUTE));
	String oSec = "0" + Integer.toString(oCalendar.get(Calendar.SECOND));
	String oMillSec = Integer.toString(oCalendar.get(Calendar.MILLISECOND)) + "00";	

	oMonth = oMonth.substring(oMonth.length() - 2);
	oDay = oDay.substring(oDay.length() - 2);
	oHour = oHour.substring(oHour.length() - 2);
	oMin = oMin.substring(oMin.length() - 2);
	oSec = oSec.substring(oSec.length() - 2);
	oMillSec = oMillSec.substring(0,3);

	fileNameTime = oYear + oMonth + oDay + oHour + oMin + oSec + oMillSec + "_" + randomValue;
	
	return fileNameTime;
}

public String tempFolderCreate(String path)
{
	StringBuffer buffer = new StringBuffer();
	SecureRandom random = new SecureRandom();
	String chars[] = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");
	String randomValue = "";
	int count = 10;
	for(int i=0; i<count; i++) {
		// buffer.append(chars[random.nextInt(chars.length)]);
		// buffer.append(chars[random.nextInt(getRandomSeed("randomfoldername", cpath))]);
		int ranVal = random.nextInt();
		if(ranVal < 0){
			ranVal = (ranVal * -1);
		}
		ranVal = (ranVal % chars.length);
		buffer.append(chars[ranVal]);
    }
	randomValue = buffer.toString();

	path = path + randomValue + File.separator;
	File tempSubFolder = new File(path); 

	if(!tempSubFolder.exists()){
		tempSubFolder.setExecutable(false, true);
		tempSubFolder.setReadable(true);
		tempSubFolder.setWritable(false, true);

		boolean returnRes = tempSubFolder.mkdir();
		if(returnRes == false){
			return "";
		}
	}

	return path;
}

public synchronized boolean tempFolderDelete(String path)
{
	boolean returnRes = true;
	//synchronized(this){
		File tempFolder = new File(path);
		if(tempFolder.exists()){
			returnRes = tempFolder.delete();
		}
	//}
	return returnRes;
}

public synchronized boolean tempFileDelete(File tempFile)
{
	boolean returnRes = true;

	if(tempFile.exists()){
		returnRes = tempFile.delete();
	}
	
	return returnRes;
}

public static String toString ( String s ) { 
	if ( s == null ) return ""; 
	return s; 
} 
%>