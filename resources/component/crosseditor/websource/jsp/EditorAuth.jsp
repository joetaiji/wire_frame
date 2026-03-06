<%@page contentType="text/html; charset=utf-8" %>
<%@page import="java.io.*"%>
<%@page import="java.net.*"%>
<%@page import="java.util.regex.PatternSyntaxException"%>
<%@page import="java.text.SimpleDateFormat"%>
<%	String ce_domain = ""; String ce_exp = ""; %>
<%@include file="EditorInformation.jsp"%>
<%@include file="Util.jsp"%>
<%@include file="SecurityTool.jsp"%>
<%
	String check_uri = "http://crosseditor.namoeditor.co.kr/application/CELicenseCheck.php";
	String authHostInfo = "";
	/*
	String conkey = detectXSSEx(request.getParameter("connection"));
	
	if(conkey != null && conkey.equalsIgnoreCase("ServerGr")){
		authHostInfo = InetAddress.getLocalHost().getHostAddress();
	}
	else {
		authHostInfo =  request.getHeader("host");
	}
	*/
	authHostInfo =  request.getHeader("host");

	check_uri += "?editordomain=" + authHostInfo;
	check_uri += "&serial=" + ce_serial;
	check_uri += "&editorkey=" + ce_editorkey;
	String editorkey = request.getParameter("editorkey");   
	String conval = ce_domain + "|" + ce_use + "|" + ce_exp + "|" + authHostInfo;

	String exp_check = "true";
	if(ce_exp.length() > 0){
		String exp_date = new String(getBase64Decode(ce_exp), "ISO-8859-1");
		SimpleDateFormat simpleDate = new SimpleDateFormat("yyyy-MM-dd");
		Date expDate = simpleDate.parse(exp_date);
		Date currentTime = new Date();
		String today = simpleDate.format(currentTime);
		Date currentDate = simpleDate.parse(today);
		if(currentDate.compareTo( expDate ) > 0) {
			exp_check = "false";
		}
	}else{
		exp_check = "false";
	}

	if (!"".equals(editorkey) && editorkey != null){
		if (editorkey.equalsIgnoreCase("ProductInfo")){
			String returnParam = ce_company + "|";
			returnParam += ce_use + "|";
			returnParam += ce_serial + "|";
			returnParam += ce_lkt;
			out.println(detectXSSEx(returnParam));
		}else{
			if("false".equalsIgnoreCase(exp_check)){
				out.println("EXPIRE");
			}else if (createEncodeEditorKey(ce_editorkey).equalsIgnoreCase(editorkey)){
				out.println("SUCCESS");
			}else{
				out.println("NULL");
			}
		}
	}else{
		conval = ce_domain + "|" + exp_check + "|" + authHostInfo + "|" + createEncodeEditorKey(ce_editorkey);

		//conval = ce_domain + "|" + ce_exp + "|" + authHostInfo + "|" + createEncodeEditorKey(ce_editorkey);
		out.println(detectXSSEx(conval));
	}

%>