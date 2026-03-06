<%@page import="java.util.*"%>
<%@page import="java.util.regex.PatternSyntaxException"%>
<%@page import="java.io.*"%>
<%@page import ="javax.xml.parsers.*"%>
<%@page import ="javax.xml.parsers.DocumentBuilder"%>
<%@page import ="javax.xml.parsers.DocumentBuilderFactory"%>
<%@page import ="org.w3c.dom.Document"%>
<%@page import ="org.w3c.dom.Element"%>
<%@page import ="org.w3c.dom.Node"%>
<%@page import ="org.w3c.dom.NodeList"%>
<%@page import ="org.xml.sax.SAXException"%>
<%@page import ="org.xml.sax.SAXParseException"%>
<%@page import ="org.xml.sax.SAXException"%>
<%@page import ="java.security.*"%>
<%@include file="../../websource/jsp/Util.jsp"%>
<%@include file="../../websource/jsp/SecurityTool.jsp"%>
<%!

public String rootFolderPath(String urlPath)
{
	String fileRealFolder = "";
	fileRealFolder = urlPath.substring(0, urlPath.lastIndexOf("/") + 1);

	return fileRealFolder;
}

public String xmlUrl(String urlPPath)
{
	return urlPPath + "config" + File.separator + "xmls" + File.separator + "Config.xml";
}

public static Element configXMlLoad(String configValue)
{
	File severXml = new File(configValue);
	
	Document doc = null;
	try{
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		/*
		dbf.setValidating(true);
		dbf.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
		dbf.setFeature("http://xml.org/sax/features/external-general-entities",false);
		dbf.setFeature("http://xml.org/sax/features/external-parameter-entities",false);
		dbf.setFeature("http://xml.org/sax/features/validation", true);
		*/
		DocumentBuilder db = dbf.newDocumentBuilder();
		doc = db.parse(severXml);
		Element root = doc.getDocumentElement();
		root.normalize();
		return root;
	}catch (SAXParseException err) {
		//System.out.println("System Error 1");
	} catch (SAXException e) {
		//System.out.println("System Error 2");
	} catch (java.net.MalformedURLException mfx) {
		//System.out.println("System Error 3");
	} catch (java.io.IOException e) {
		//System.out.println("System Error 4");
	} catch (javax.xml.parsers.ParserConfigurationException e) {
		//System.out.println("System Error 5");
	}
	return null;
}

public Hashtable childValueList(Element root)
{
	Hashtable settingValue = new Hashtable();
	List addMenuList = new ArrayList();
	
	NodeList nodeList = root.getChildNodes();
	Node node;
	Node cNode;
	NodeList childNodes;
	settingValue.put("AddMenuCheck", "false");
	

	try{
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
	} 
	catch (RuntimeException e) {
			//System.out.println("System Error 6");
			return settingValue;
	}
}

public List childrenList(Node root)
{
	NodeList nodeList = root.getChildNodes();
	List childrenList = new ArrayList();
	Node node;
	
		for(int i=0; i<nodeList.getLength(); i++){
			node = nodeList.item(i);
			if(node.getNodeType() == Node.ELEMENT_NODE){	
				 childrenList.add(node.getNodeName());
			}
		}
		return childrenList;
	
}

public String skinDirectory(String urlPPath,String xmlInfo)
{
	urlPPath = detectXSSEx(urlPPath);
	xmlInfo = detectXSSEx(xmlInfo);
	String skinValue = "";
	String skinDirUrl = urlPPath + "template";
	
	File skinDir = new File(skinDirUrl);
	String contents[] = skinDir.list();

	if(contents != null){
		for(int i=0;i<contents.length;i++){
			File dirCheck = new File(skinDirUrl+File.separator+contents[i]);
			try{
				if(dirCheck.isDirectory()){
					if(skinValue.equalsIgnoreCase("")) skinValue = contents[i]; 
					else skinValue = skinValue + "," + contents[i];
				}
			}
			catch(NumberFormatException e){
				continue;
			}
		}
	}

	String skinValues[] = skinValue.split(",");
	String optionTag = "<select name='Skin' id='Skin' class='inputSelectStyle'>";
	String selectCheck = "";

	for(int i=0; i<skinValues.length; i++){
		if(skinValues[i] != null && skinValues[i].equalsIgnoreCase("webtree")){
			continue;
		}
		if(xmlInfo.equalsIgnoreCase(skinValues[i])){
			selectCheck = "selected=\"selected\"";
			optionTag = optionTag + "<option value='"+skinValues[i]+"' "+selectCheck+" >"+skinValues[i]+"</option>";
		}
		else{ 
			optionTag = optionTag + ("<option value='"+skinValues[i]+"'>"+skinValues[i]+"</option>");
		}
		selectCheck = "";
	}
	optionTag = optionTag + "</select>";
	return optionTag ;
}

public String iconColorSelect(String xmlInfo)
{
	xmlInfo = detectXSSEx(xmlInfo);
	String iconValues[] = {"default", "black", "blue", "bluegreen"};
	String optionTag = "<select name='IconColor' id='IconColor' class='inputSelectStyle'>";
	String selectCheck = "";

	for(int i=0; i<iconValues.length; i++){
		if(iconValues[i] != null && iconValues[i].equalsIgnoreCase("webtree")){
			continue;
		}
		if(xmlInfo.equalsIgnoreCase(iconValues[i])){
			selectCheck = "selected=\"selected\"";
			optionTag = optionTag + "<option value='"+iconValues[i]+"' "+selectCheck+" >"+iconValues[i]+"</option>";
		}
		else{ 
			optionTag = optionTag + ("<option value='"+iconValues[i]+"'>"+iconValues[i]+"</option>");
		}
		selectCheck = "";
	}
	optionTag = optionTag + "</select>";
	return optionTag ;
}

public boolean xmlCreate(String xmlText, String filenames)
{
	boolean check = true;

	Writer fout = null;
	OutputStream fos = null;
	try{
		File f = new File(filenames);
		if(f.canWrite()){
			
			fos = new FileOutputStream(f);
			fout = new OutputStreamWriter(fos, "UTF-8");
			fout.write(detectXSSEx2(xmlText));
		}
		else{
			check = false;
		}
	}
	catch (java.io.IOException e) {
		//System.out.println("System Error 8");
	}
	finally{
		try{
				if( fout != null){
					fout.close();
					fout = null;
				}
				if( fos != null){
					fos.close();
					fos = null;
				}
			}catch(java.io.IOException err1){
				System.out.println("파일 스트림 닫기 중 IOException 발생");
			}catch(Exception err){
				System.out.println("파일 스트림 닫기 중 예상치 못한 오류 발생");
			}
	}
	return check;
}

public String encrypt(String EncMthd,String strData)
{
	MessageDigest md;
	String strENCData = "";

	try{
			md = MessageDigest.getInstance(EncMthd);
			byte[] byBytes = strData.getBytes();
			md.update(byBytes);
			byte[] digest = md.digest();
			for(int i=0; i<digest.length; i++){
				strENCData = strENCData + Integer.toHexString(digest[i] & 0xFF).toUpperCase();
			}
		
			return strENCData;
	}
	catch(NoSuchAlgorithmException e){
			//System.out.println("System Error 9");
			return strENCData = "";
	}
}

public String manageInFo_text(String urlPPath)
{
	String manageInfoPath = urlPPath + "manageInfo.jsp";
	String manageInfoStr = "";
	BufferedReader manageInfoText = null;
	FileReader fr = null;
	try{
		fr = new FileReader(manageInfoPath);
		manageInfoText = new BufferedReader(fr);


		char[] buffer = new char[1024];

		manageInfoText.read(buffer,0,1024);



		for (int i=0; buffer.length>i; i++)
        {
			if(buffer[i] != (char)0)
            {
               manageInfoStr += buffer[i];
            }
        }
		manageInfoText.close();
		fr.close();

	}catch(java.io.FileNotFoundException e1){
		//System.out.println("System Error 10");		
	}catch(java.io.IOException e2){
		//System.out.println("System Error 11");
	}finally{
		try{
			if( manageInfoText != null){
				manageInfoText.close();
				manageInfoText = null;
			}
			if( fr != null){
				fr.close();
				fr = null;
			}
		}catch(java.io.IOException err1){
			//System.out.println("An internal exception occured!!!");
		}catch(Exception err){
			//System.out.println("An internal exception occured!!!");
		}
	}

	return manageInfoStr;
}

public List xmlField_list(Element root){
	
	List parent = childrenList(root);
	List children;
	List xmlField_list = new ArrayList();

	for (int i=0; i<parent.size(); i++){
		NodeList child = root.getElementsByTagName((String)parent.get(i));
		Node node = child.item(0);
		
		children = childrenList(node);
		for (int j=0; j<children.size(); j++){
			xmlField_list.add(children.get(j));
		}
	}

	return xmlField_list;
}

public boolean update_check(String update_xml_url,String before_xml_url){

	boolean update_check = false;
	Element update_xml_root = configXMlLoad(update_xml_url);
	List update_xml = xmlField_list(update_xml_root);
	Element before_xml_root = configXMlLoad(before_xml_url);
	List before_xml= xmlField_list(before_xml_root);
	
	Hashtable update_xml_settingValue = childValueList(update_xml_root);
	Hashtable before_xml_settingValue = childValueList(before_xml_root);

	String getValue1 = "";
	String getValue2 = "";

	boolean check = false;
	for (int i=0; i<update_xml.size(); i++){

		check = false;
		for (int j=0; j<before_xml.size(); j++){
			if(update_xml.get(i).toString().equalsIgnoreCase(before_xml.get(j).toString())){

				if(update_xml.get(i).toString() == "Version" || update_xml.get(i).toString() == "Version_daemon" || update_xml.get(i).toString() == "Version_com") {
					getValue1 = update_xml_settingValue.get(update_xml.get(i)).toString();
					getValue2 = before_xml_settingValue.get(before_xml.get(j)).toString();

					if(getValue1.equals(getValue2)) {
						check = true;
						break;
					}

				} else {
					check = true;
					break;
				}

			}
		}
		if(check == false)
		{
			update_check = true;
			break;
		}
	}

	return update_check;
}

public String update_xml(String update_xml_url,String before_xml_url){

	Element update_xml_root = configXMlLoad(update_xml_url);
	Element before_xml_root = configXMlLoad(before_xml_url);
	
	Hashtable update_xml_settingValue = childValueList(update_xml_root);
	Hashtable before_xml_settingValue = childValueList(before_xml_root);

	String StartTag = update_xml_root.getNodeName();
	String xml_Text = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
	
	xml_Text += "<" + StartTag + ">\n";

	List parent = childrenList(update_xml_root);
	boolean chkForce = false;

	for(int i=0;i<parent.size();i++){
		xml_Text +="	<" + parent.get(i) + ">\n";
		NodeList child = update_xml_root.getElementsByTagName((String)parent.get(i));	
		Node node = child.item(0);
		List children = childrenList(node);

		for(int j=0;j<children.size();j++){

			// node 이름이 Version, Version_daemon, Version_com 이면 강제 업데이트
			String getNode_Name = children.get(j).toString();
			if( getNode_Name.equals("Version") || getNode_Name.equals("Version_daemon") || getNode_Name.equals("Version_com") ) {
				chkForce = true;
			}
			
			if(chkForce) {
				String getNode_Value = " " + update_xml_settingValue.get(children.get(j)) + " ";
				getNode_Value = getNode_Value.trim();
				if(getNode_Value.equalsIgnoreCase("[]")) getNode_Value = "";

				xml_Text += "		<" + children.get(j) + ">" + getNode_Value + "</" + children.get(j) + ">\n";
				
				// 강제 수정 후 조건 false
				chkForce = false;
			} else {
				
				if(children.get(j).toString().equalsIgnoreCase("AddMenu") && before_xml_settingValue.get("AddMenuCheck").toString().equalsIgnoreCase("true")) {
					List addMenuListValue = (List)before_xml_settingValue.get("AddMenu");
					for(int k=0; k<addMenuListValue.size(); k++){
						xml_Text += "		<" + children.get(j) + ">" + addMenuListValue.get(k) + "</" + children.get(j) + ">\n";
					}
				}
				else if(before_xml_settingValue.get(children.get(j)) != null){
					xml_Text += "		<" + children.get(j) + ">" + before_xml_settingValue.get(children.get(j)) + "</" + children.get(j) + ">\n";
				}
				else{
					String getXmlSettingValue = " " + update_xml_settingValue.get(children.get(j)) + " ";
					getXmlSettingValue = getXmlSettingValue.trim();
					if(getXmlSettingValue.equalsIgnoreCase("[]")) getXmlSettingValue = "";
					
					xml_Text += "		<" + children.get(j) + ">" + getXmlSettingValue + "</" + children.get(j) + ">\n";
				}

			}

		}

		xml_Text +="	</" + parent.get(i) + ">\n";
	}
	
	xml_Text += "</" + StartTag + ">\n";
	boolean check_save = xmlCreate(xml_Text,before_xml_url);
	
	if(check_save)return "sucess";
	else return "fail";
	
}

%>