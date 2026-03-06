<%@page contentType="text/html;charset=utf-8" %>
<%@include file = "manager_util.jsp"%>
<%@include file = "./include/session_check.jsp"%>
<%
	String fileRealFolder = "";
	String ContextPath = request.getContextPath();
	String urlPath = rootFolderPath(request.getRequestURI());
	urlPath = urlPath.substring(0, urlPath.indexOf("manage/jsp"));

	ServletContext context = getServletConfig().getServletContext();
	fileRealFolder = context.getRealPath(urlPath);

	//2013.08.26 [2.0.5.23] mwhong tomcat8.0 에서 getRealPath가 null을 리턴하여 수정
	if(/*fileRealFolder == null &&*/ urlPath != null && ContextPath != null){
		fileRealFolder = context.getRealPath(urlPath.substring(ContextPath.length()));
	}

	if (ContextPath != null && !ContextPath.equals("") && !ContextPath.equals("/")){
		File tempFileRealDIR = new File(fileRealFolder);
		if(!tempFileRealDIR.exists()){
			if (urlPath != null && urlPath.indexOf(ContextPath) != -1){
				String rename_image_temp = urlPath.substring(ContextPath.length());
				fileRealFolder = context.getRealPath(rename_image_temp);
			}
		}
	}

	if (fileRealFolder.lastIndexOf(File.separator) != fileRealFolder.length() - 1){
		fileRealFolder = fileRealFolder + File.separator;
	}

	String url = xmlUrl(fileRealFolder);
	Element root = configXMlLoad(url);
	Hashtable settingValue = childValueList(root);

	String encodingStyleValue = "";
	String EncodingValue = "";

	if (settingValue.get("UploadFileNameType") != null){
		String FileNameType = (String)settingValue.get("UploadFileNameType");
	
		if (FileNameType != ""){
			if(FileNameType.indexOf(",")!= -1){
				String FileNameTypeArr[] = FileNameType.split(",");
				encodingStyleValue = FileNameTypeArr[0];
				if(FileNameTypeArr.length > 1) EncodingValue = FileNameTypeArr[1];
			}
			else{
				encodingStyleValue = FileNameType;
			}
		}
	}

	String userAddMenuList = "";
	
	if(settingValue.get("AddMenuCheck").equals("true")){
		if(settingValue.get("AddMenu") != ""){
			List addMenuListValue = (List)settingValue.get("AddMenu");
			for(int i=0; i<addMenuListValue.size(); i++){
				if(userAddMenuList.equals("")) userAddMenuList = (String)addMenuListValue.get(i);
				else userAddMenuList += "|" + (String)addMenuListValue.get(i);
			}
		}
	}
	
	if (settingValue.get("AccessibilityOption") == null  || settingValue.get("AccessibilityOption") == "" ) settingValue.put("AccessibilityOption", "0");
	if (settingValue.get("UploadFileSubDir") == null || settingValue.get("UploadFileSubDir") == "") settingValue.put("UploadFileSubDir", "true");
	if (settingValue.get("HideAddImageCheckbox") == null || settingValue.get("HideAddImageCheckbox") == "") settingValue.put("HideAddImageCheckbox", "false");
	if (settingValue.get("DisplayLoadingBar") == null || settingValue.get("DisplayLoadingBar") == "") settingValue.put("DisplayLoadingBar", "true");
	if (settingValue.get("SupportBrowser") == null || settingValue.get("SupportBrowser") == "") settingValue.put("SupportBrowser", "");
	
	//CE3 추가된 요소들
	if (settingValue.get("UploadFileExtBlockList") == null|| settingValue.get("UploadFileExtBlockList") == "") settingValue.put("UploadFileExtBlockList", "0|jsp,exe,php");
	if (settingValue.get("UploadImageFileExtBlockList") == null|| settingValue.get("UploadImageFileExtBlockList") == "") settingValue.put("UploadImageFileExtBlockList", "0|gif,jpeg,jpg,png,bmp");
	if (settingValue.get("AttributeBlockList") == null || settingValue.get("AttributeBlockList") == "") settingValue.put("AttributeBlockList", "0|onclick,onerror");
	if (settingValue.get("TagBlockList") == null || settingValue.get("TagBlockList") == "") settingValue.put("TagBlockList", "0|iframe,meta");
	if (settingValue.get("FontColor") == null || settingValue.get("FontColor") == "") settingValue.put("FontColor", "#000000");
	if (settingValue.get("FontSizeList") == null || settingValue.get("FontSizeList") == "") settingValue.put("FontSizeList", "7.5pt,8pt,9pt,10pt,11pt,12pt,14pt,16pt,18pt,20pt,22pt,24pt,26pt,28pt,36pt");
	if (settingValue.get("LineHeightList") == null || settingValue.get("LineHeightList") == "") settingValue.put("LineHeightList", "100%,120%,140%,150%,160%,180%,200%");
	if (settingValue.get("IndentPaddingValue") == null || settingValue.get("IndentPaddingValue") == "") settingValue.put("IndentPaddingValue", "40");
	if (settingValue.get("ImgLineColor") == null || settingValue.get("ImgLineColor") == "") settingValue.put("ImgLineColor", "#000000");
	if (settingValue.get("TableLineColor") == null || settingValue.get("TableLineColor") == "") settingValue.put("TableLineColor", "#000000");
	if (settingValue.get("TableBGColor") == null || settingValue.get("TableBGColor") == "") settingValue.put("TableBGColor", "#FFFFFF");
	
	if (settingValue.get("DefaultFont") == null || settingValue.get("DefaultFont") == "") settingValue.put("DefaultFont", "");
	if (settingValue.get("DefaultFontSize") == null || settingValue.get("DefaultFontSize") == "") settingValue.put("DefaultFontSize", "");
	if (settingValue.get("Placeholder") == null || settingValue.get("Placeholder") == "") settingValue.put("Placeholder", "");

	// BlockList 적용 체크(적용:UploadFileExtBlockListChecked, 목록:UploadFileExtBlockListTextarea)
	String[] UploadFileExtBlockListArr;
	if (settingValue.get("UploadFileExtBlockList") != null && settingValue.get("UploadFileExtBlockList").toString().indexOf("|") != -1) {
		UploadFileExtBlockListArr = settingValue.get("UploadFileExtBlockList").toString().split("\\|");
		settingValue.put("UploadFileExtBlockListChecked", ("0".equals(UploadFileExtBlockListArr[0]) ? "" : " checked=\"checked\" ")) ;
		
		if(UploadFileExtBlockListArr.length > 1){
			settingValue.put("UploadFileExtBlockListTextarea", UploadFileExtBlockListArr[1]);
		}else{
			settingValue.put("UploadFileExtBlockListTextarea", "");
		}
		
	}

	String[] UploadImageFileExtBlockListArr;
	if (settingValue.get("UploadImageFileExtBlockList") != null && settingValue.get("UploadImageFileExtBlockList").toString().indexOf("|") != -1) {
		UploadImageFileExtBlockListArr = settingValue.get("UploadImageFileExtBlockList").toString().split("\\|");
		settingValue.put("UploadImageFileExtBlockListChecked", ("0".equals(UploadImageFileExtBlockListArr[0]) ? "" : " checked=\"checked\" ")) ;
		
		if(UploadImageFileExtBlockListArr.length > 1){
			settingValue.put("UploadImageFileExtBlockListTextarea", UploadImageFileExtBlockListArr[1]);
		}else{
			settingValue.put("UploadImageFileExtBlockListTextarea", "");
		}
		
	}

	String[] AttributeBlockListArr;
	if (settingValue.get("AttributeBlockList") != null && settingValue.get("AttributeBlockList").toString().indexOf("|") != -1) {
		AttributeBlockListArr = settingValue.get("AttributeBlockList").toString().split("\\|");
		settingValue.put("AttributeBlockListChecked", ("0".equals(AttributeBlockListArr[0]) ? "" : " checked=\"checked\" ")) ;
		
		if(AttributeBlockListArr.length > 1){
			settingValue.put("AttributeBlockListTextarea", AttributeBlockListArr[1]);
		}else{
			settingValue.put("AttributeBlockListTextarea", "");
		}	
	}
	
	String[] TagBlockListArr;
	if (settingValue.get("TagBlockList") != null && settingValue.get("TagBlockList").toString().indexOf("|") != -1) {
		TagBlockListArr = settingValue.get("TagBlockList").toString().split("\\|");
		settingValue.put("TagBlockListChecked", ("0".equals(TagBlockListArr[0]) ? "" : " checked=\"checked\" ")) ;
		
		if(TagBlockListArr.length > 1){
			settingValue.put("TagBlockListTextarea", TagBlockListArr[1]);
		}else{
			settingValue.put("TagBlockListTextarea", "");
		}	
	}
	
	//줄바꾸기설정
	settingValue.put("ReturnKeyActionBRChecked", ("false".equals(settingValue.get("ReturnKeyActionBR")) ? "" : " checked=\"checked\" ")) ;

	// 아이콘 비활성화
	/*
	String[] DisableToolbarButtonsArr;
	if (settingValue.get("DisableToolbarButtons") != null && settingValue.get("DisableToolbarButtons").toString().indexOf("|") != -1) {
		DisableToolbarButtonsArr = settingValue.get("DisableToolbarButtons").toString().split("\\|");
		settingValue.put("DisableToolbarButtonsChecked", ("0".equals(DisableToolbarButtonsArr[0]) ? "" : " checked=\"checked\" ")) ;
		
		if(DisableToolbarButtonsArr.length > 1){
			settingValue.put("DisableToolbarButtonsLists", DisableToolbarButtonsArr[1]);
		}
		
	}
*/
	//템플릿 설정//////////////////////////////////////////////////////
	String[] TemplateListArr;
	TemplateListArr = new String[1];
	if (settingValue.get("Template") != null && settingValue.get("Template").toString().indexOf(",") != -1) {
		TemplateListArr = settingValue.get("Template").toString().split(",");
	}else if(settingValue.get("Template") != null) {
		
		TemplateListArr[0] = settingValue.get("Template").toString();
	}
	///////////////////////////////////////////////////////////////////
	
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
<title>Namo CrossEditor : Admin</title>
	<script type="text/javascript">var pe_yi="pe_Nh"; </script>
	<script type="text/javascript" src="../../lib/jquery-1.7.2.min.js"> </script>
	<script type="text/javascript">var ce$=namo$.noConflict(true); </script>
	<script type="text/javascript" src="../manage_common.js"> </script>
	<script type="text/javascript" language="javascript" src="../../js/namo_cengine.js"> </script>
	<script type="text/javascript" language="javascript" src="../manager.js"> </script>
	<script type="text/javascript" src="../jscolor/jscolor.js"> </script>
	<link type="text/css" rel="stylesheet" href="../../css/namose_general.css" />
	<link type="text/css" rel="stylesheet" href="../css/common.css" />
	<style>.icon{margin:1px 1px 1px 1px;padding:0px;width:18px;height:18px;cursor:pointer;}</style>
</head>

<body>

<%@include file = "../include/top.html"%>

<form method="post" id="adminSetForm" name="adminSetForm" action="manager_proc.jsp" onsubmit="return pe_bA();">



<div id="pe_aEQ">
	<table class="pe_wT">
		<tr>
			<td class="pe_jq">

				<table id="Info">
					<tr>
						<td style="padding:0 0 0 10px;height:30px;text-align:left">
						<font style="font-size:14pt;color:#3e77c1;font-weight:bold;text-decoration:none;"><span id="pe_EM"></span></font></td>
						<td id="InfoText"><span id="pe_xi"></span></td>
					</tr>
					<tr>
						<td colspan="2"><img id="pe_Gt" src="../images/title_line.jpg" alt="" /></td>
					</tr>
				</table>

				<table class="pe_po">
					<tr>
						<td class="pe_aKj">				
							<ul>
								<li class="pe_mF pe_No"><input type="button" id="setting_base" value="" style="width:110px;height:28px;" class="pe_vN pe_gk" /></li>
								<li class="pe_mF"><input type="button" id="setting_edit" value="" style="width:110px;height:28px;" class="pe_vN pe_gk" /></li>
								<li class="pe_mF"><input type="button" id="setting_view" value="" style="width:110px;height:28px;" class="pe_vN pe_gk" /></li>
								<li class="pe_mF"><input type="button" id="setting_ab" value="" style="width:110px;height:28px;" class="pe_vN pe_gk" /></li>
							</ul>
						
						</td>
					</tr>
					<tr>
						<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_IY"></span></font></td>
					</tr>
				</table>

			</td>
		</tr>
		
		<tr>
			<td class="pe_jq">
				<div id="pe_ahr">
					<table class="pe_wn">
						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
							 
								<table class="pe_fa">
								
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_DO"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='WebServerOS' id='WebServerOS' class="inputSelectStyle">
												<option value=''></option>
												<option value='WINDOW' <% if(settingValue.get("WebServerOS").equals("WINDOW")) out.println("selected=\"selected\"");%>>WINDOW</option>
												<option value='LINUX' <% if(settingValue.get("WebServerOS").equals("LINUX"))out.println("selected=\"selected\"");%>>LINUX</option>
												<option value='UNIX' <% if(settingValue.get("WebServerOS").equals("UNIX")) out.println("selected=\"selected\"");%>>UNIX</option>
											</select>
										</td>
									</tr>
									
									<tr>
										<td class = "pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_DN"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='WebServerInfo' id='WebServerInfo' class="inputSelectStyle">
												<option value=''></option>
												<option value='IIS' <% if(settingValue.get("WebServerInfo").equals("IIS")) out.println("selected=\"selected\"");%>>IIS</option>
												<option value='Apache' <% if(settingValue.get("WebServerInfo").equals("Apache"))out.println("selected=\"selected\"");%>>Apache</option>
												<option value='Tomcat' <% if(settingValue.get("WebServerInfo").equals("Tomcat")) out.println("selected=\"selected\"");%>>Tomcat</option>
												<option value='Resin' <% if(settingValue.get("WebServerInfo").equals("Resin")) out.println("selected=\"selected\"");%>>Resin</option>
												<option value='Jeus' <% if(settingValue.get("WebServerInfo").equals("Jeus")) out.println("selected=\"selected\"");%>>Jeus</option>
												<option value='WebLogic' <% if(settingValue.get("WebServerInfo").equals("WebLogic")) out.println("selected=\"selected\"");%>>WebLogic</option>
												<option value='WebSphere' <% if(settingValue.get("WebServerInfo").equals("WebSphere")) out.println("selected=\"selected\"");%>>WebSphere</option>
												<option value='iPlanet' <% if(settingValue.get("WebServerInfo").equals("iPlanet")) out.println("selected=\"selected\"");%>>iPlanet</option>
											</select>
										</td>
									</tr>
									
									<tr>
										<td class = "pe_eB" colspan="3"></td>
									</tr>
									
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_EJ"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='WebLanguage' id='WebLanguage' class="inputSelectStyle">
												<option value=''></option>
												<option value='ASP' <% if(settingValue.get("WebLanguage").equals("ASP")) out.println("selected=\"selected\"");%>>ASP</option>
												<option value='JSP' <% if(settingValue.get("WebLanguage").equals("JSP")) out.println("selected=\"selected\"");%>>JSP</option>
												<option value='PHP' <% if(settingValue.get("WebLanguage").equals("PHP")) out.println("selected=\"selected\"");%>>PHP</option>
												<option value='ASP.NET' <% if(settingValue.get("WebLanguage").equals("ASP.NET")) out.println("selected=\"selected\"");%>>ASP.NET</option>
												<option value='SERVLET' <% if(settingValue.get("WebLanguage").equals("SERVLET")) out.println("selected=\"selected\"");%>>SERVLET</option>
											</select>
										</td>
									</tr>
									
									<tr>
										<td class = "pe_eB" colspan="3"></td>
									</tr>
									
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Cc"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="ImageSavePath" class="pe_mP" name="ImageSavePath" value="<%=settingValue.get("ImageSavePath")%>" /> ex) http:// www.mysite.com/image
										</td>
									</tr>
									
									<tr>
										<td class = "pe_eB" colspan="3"></td>
									</tr>

									<% if (settingValue.get("UploadFileNameType") != null){ %>
									
									<div id="pe_aiy">
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Es"></span></b></td>
										<td class="pe_fy"></td>
										<td >
											<table class="pe_fa">
												<tr>
													<td class="pe_eA"> &nbsp;&nbsp;
														<input type="radio" name="encodingStyle" id="pe_Vx" value="real" /><span id="pe_EL"></span>
														<input type="hidden" id="UploadFileNameType" name="UploadFileNameType" value="" />
													</td>
												</tr>
												<tr>
													<td class = "pe_eB" colspan="3"></td>
												</tr>
												<tr>
													<td class="pe_eA"> &nbsp;&nbsp;
													<input type="radio" name="encodingStyle" id="pe_aaD" value="trans" /><span id="pe_Dk"></span>
													</td>
												</tr>
												<tr>
													<td class = "pe_eB" colspan="3"></td>
												</tr>
												<tr>
													<td class="pe_eA"> &nbsp;&nbsp;
														<input type="radio" name="encodingStyle" id="pe_acB" value="random" /><span id="pe_Lr"></span>
													</td>
												</tr>
											</table>
										</td>
									</tr>

									<tr>
										<td class = "pe_eB" colspan="3"></td>
									</tr>
									</div>

									<% } %>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Lh"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA"> &nbsp;
											<input type="hidden" id="UploadFileSubDir" name ="UploadFileSubDir" value="<%=settingValue.get("UploadFileSubDir")%>" />
											<input type="radio" id="pe_Im" name="pe_aiK" value="true" /><label for="pe_Im"><span id="pe_KX"></span></label>&nbsp;&nbsp;
											<input type="radio" id="pe_HE" name="pe_aiK" value="false" /><label for="pe_HE"><span id="pe_KC"></span></label>
										</td>
									</tr>

									<tr>
										<td class = "pe_eB" colspan="3"></td>
									</tr>

									
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_DL"></span></b></td>
										<td class="pe_fy"></td>
										<td >
											<table class="pe_fa">
												<tr>
													<td >&nbsp;&nbsp;<span id="pe_DG"></span></td>
													<td class="pe_fy"></td>
													<td class="pe_eA"><input type="text" id="Width" name="Width" class="pe_oU" maxlength="10" value="<%=settingValue.get("Width")%>" />
													px</td>
												</tr>
												<tr>
													<td class = "pe_eB" colspan="3"></td>
												</tr>
												<tr>
													<td >&nbsp;&nbsp;<span id="pe_BM"></span></td>
													<td class="pe_fy"></td>
													<td class="pe_eA"><input type="text" id="Height" name="Height" class="pe_oU" maxlength="10" value="<%=settingValue.get("Height")%>" /> px
													</td>
												</tr>	
											</table>
										</td>
									</tr>
								</table>

								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
											
							</td>
						</tr>
						<tr>
							<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_Jz"></span></font></td>
						</tr>

						<tr>
							<td>
						
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>

								<table class="pe_fa">
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_LK"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='SetFocus' id='SetFocus' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("SetFocus").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("SetFocus").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_KW"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='LineHeight' id='LineHeight' class="inputSelectStyle">
												<option value=''></option>
												<option value='100%' <% if(settingValue.get("LineHeight").equals("100%")) out.println("selected=\"selected\"");%>>100%</option>
												<option value='120%' <% if(settingValue.get("LineHeight").equals("120%")) out.println("selected=\"selected\"");%>>120%</option>
												<option value='140%' <% if(settingValue.get("LineHeight").equals("140%")) out.println("selected=\"selected\"");%>>140%</option>
												<option value='160%' <% if(settingValue.get("LineHeight").equals("160%")) out.println("selected=\"selected\"");%>>160%</option>
												<option value='180%' <% if(settingValue.get("LineHeight").equals("180%")) out.println("selected=\"selected\"");%>>180%</option>	
												<option value='200%' <% if(settingValue.get("LineHeight").equals("200%")) out.println("selected=\"selected\"");%>>200%</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Mu"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='UnloadWarning' id='UnloadWarning' class="inputSelectStyle">
												<option value='false' <% if(settingValue.get("UnloadWarning").equals("false")) out.println("selected=\"selected\"");%>>false</option>
												<option value='true' <% if(settingValue.get("UnloadWarning").equals("true")) out.println("selected=\"selected\"");%>>true</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_LX"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='SetDebug' id='SetDebug' class="inputSelectStyle">
												<option value='false' <% if(settingValue.get("SetDebug").equals("false")) out.println("selected=\"selected\"");%>>false</option>
												<option value='true' <% if(settingValue.get("SetDebug").equals("true")) out.println("selected=\"selected\"");%>>true</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Lw"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='HTMLTabByTableLock' id='HTMLTabByTableLock' class="inputSelectStyle">
												<option value='false' <% if(settingValue.get("HTMLTabByTableLock").equals("false")) out.println("selected=\"selected\"");%>>false</option>
												<option value='true' <% if(settingValue.get("HTMLTabByTableLock").equals("true")) out.println("selected=\"selected\"");%>>true</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Lc"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='HTMLTabContents' id='HTMLTabContents' class="inputSelectStyle">
												<option value='html' <% if(settingValue.get("HTMLTabContents").equals("html")) out.println("selected=\"selected\"");%>>html</option>
												<option value='body' <% if(settingValue.get("HTMLTabContents").equals("body")) out.println("selected=\"selected\"");%>>body</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Ke"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='AllowContentScript' id='AllowContentScript' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("AllowContentScript").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("AllowContentScript").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_JS"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='AllowContentIframe' id='AllowContentIframe' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("AllowContentIframe").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("AllowContentIframe").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_IJ"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='CharSet' id='CharSet' class="inputSelectStyle">
												<option value=''></option>
												<option value='auto' <% if(settingValue.get("CharSet").equals("auto")) out.println("selected=\"selected\"");%>></option>
												<option value='utf-8' <% if(settingValue.get("CharSet").equals("utf-8")) out.println("selected=\"selected\"");%>>utf-8</option>
												<option value='euc-kr' <% if(settingValue.get("CharSet").equals("euc-kr")) out.println("selected=\"selected\"");%>>euc-kr</option>
												<option value='ks_c_5601-1987' <% if(settingValue.get("CharSet").equals("ks_c_5601-1987")) out.println("selected=\"selected\"");%>>ks_c_5601-1987</option>
												<option value='ms949' <% if(settingValue.get("CharSet").equals("ms949")) out.println("selected=\"selected\"");%>>ms949</option>
												<option value='iso-8859-1' <% if(settingValue.get("CharSet").equals("iso-8859-1")) out.println("selected=\"selected\"");%>>iso-8859-1</option>
												<option value='iso-8859-2' <% if(settingValue.get("CharSet").equals("iso-8859-2")) out.println("selected=\"selected\"");%>>iso-8859-2</option>
												<option value='euc-jp' <% if(settingValue.get("CharSet").equals("euc-jp")) out.println("selected=\"selected\"");%>>euc-jp</option>
												<option value='shift_jis' <% if(settingValue.get("CharSet").equals("shift_jis")) out.println("selected=\"selected\"");%>>shift_jis</option>
												<option value='gb2312' <% if(settingValue.get("CharSet").equals("gb2312")) out.println("selected=\"selected\"");%>>gb2312</option>
												<option value='gbk' <% if(settingValue.get("CharSet").equals("gbk")) out.println("selected=\"selected\"");%>>gbk</option>
												<option value='big5' <% if(settingValue.get("CharSet").equals("big5")) out.println("selected=\"selected\"");%>>big5</option>
												<option value='big5-hkscs' <% if(settingValue.get("CharSet").equals("big5-hkscs")) out.println("selected=\"selected\"");%>>big5-hkscs</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_DQ"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="DocBaseURL" name="DocBaseURL" class="pe_mP" value="<%=settingValue.get("DocBaseURL")%>" /> ex) http://www.mysite.com/doc.html 
										</td>
									</tr>
									
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_PK"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='ResizeBar' id='ResizeBar' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("ResizeBar").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("ResizeBar").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>


									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_PN"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='Menu' id='Menu' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("Menu").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("Menu").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_ML"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='QuickMenu' id='QuickMenu' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("QuickMenu").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("QuickMenu").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>


									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Bk"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='ServerUrl' id='ServerUrl' class="inputSelectStyle">
												<option value='' <% if(settingValue.get("ServerUrl").equals("")) out.println("selected=\"selected\"");%>></option>
												<option value='1' <% if(settingValue.get("ServerUrl").equals("1")) out.println("selected=\"selected\"");%>>domain</option>
												<option value='2' <% if(settingValue.get("ServerUrl").equals("2")) out.println("selected=\"selected\"");%>>absolute</option>
											</select>
										</td>
									</tr>
								
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Og"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='DisplayLoadingBar' id='DisplayLoadingBar' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("DisplayLoadingBar").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("DisplayLoadingBar").equals("false")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_MJ"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="number" min="0" max="60" style="ime-mode:disabled;" id="AutoSavePeriod" name="AutoSavePeriod" class="pe_mP" value="<%=settingValue.get("AutoSavePeriod")%>" /><b><span id="pe_Ka"></span></b>&nbsp;&nbsp;<span id="pe_NX"></span>
										</td>
									</tr>
									
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_IO"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='HideAddImageCheckbox' id='HideAddImageCheckbox' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("HideAddImageCheckbox").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("HideAddImageCheckbox").equals("false") || settingValue.get("HideAddImageCheckbox").equals("")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Oo"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='SupportBrowser' id='SupportBrowser' class="inputSelectStyle">
												<option value='' <% if(settingValue.get("SupportBrowser").equals("")) out.println("selected=\"selected\"");%>></option>
												<option value='1' <% if(settingValue.get("SupportBrowser").equals("1")) out.println("selected=\"selected\"");%>></option>
												<option value='11' <% if(settingValue.get("SupportBrowser").equals("11")) out.println("selected=\"selected\"");%>></option>
												<option value='10' <% if(settingValue.get("SupportBrowser").equals("10")) out.println("selected=\"selected\"");%>></option>
												<option value='9' <% if(settingValue.get("SupportBrowser").equals("9")) out.println("selected=\"selected\"");%>></option>
												<option value='8' <% if(settingValue.get("SupportBrowser").equals("8")) out.println("selected=\"selected\"");%>></option>
												<option value='7' <% if(settingValue.get("SupportBrowser").equals("7")) out.println("selected=\"selected\"");%>></option>
											</select>
										</td>
									</tr>
									<tr id="pe_aHI">
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Ob"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='PasteSelectFormat' id='PasteSelectFormat' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("PasteSelectFormat").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("PasteSelectFormat").equals("false") || settingValue.get("PasteSelectFormat").equals("")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Sd"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='UseTagCleaner' id='UseTagCleaner' class="inputSelectStyle">
												<option value='true' <% if(settingValue.get("UseTagCleaner").equals("true")) out.println("selected=\"selected\"");%>>true</option>
												<option value='false' <% if(settingValue.get("UseTagCleaner").equals("false") || settingValue.get("UseTagCleaner").equals("")) out.println("selected=\"selected\"");%>>false</option>
											</select>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									
								</table>

								
							
							</td>
						</tr> 						
						<tr>
							<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_Jp"></span></font></td>
						</tr>

						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
								
								<table class="pe_fa">

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="AdminPageUploadFileExtBlockList"><span id="pe_At"></span></b></td>
										<td class="pe_fy"></td>
										<td>
											<table class="pe_fa">
												<input type="hidden" name="UploadImageFileExtBlockList" value="<%=settingValue.get("UploadImageFileExtBlockList")%>" />
												<tr>
													<td class="pe_eA"><input type="checkbox" id="UploadImageFileExtBlockListChecked" <%=settingValue.get("UploadImageFileExtBlockListChecked")%>/><span id="pe_pQ"></span></td>
												</tr>
												<tr>
													<td class="pe_eA"><textarea id="UploadImageFileExtBlockListTextarea" cols="70" rows="2"><%=settingValue.get("UploadImageFileExtBlockListTextarea")%></textarea><br /><span id="pe_Db"></span></td>
												</tr>	
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="AdminPageUploadFileExtBlockList"></span></b></td>
										<td class="pe_fy"></td>
										<td>
											<table class="pe_fa">
												<input type="hidden" name="UploadFileExtBlockList" value="<%=settingValue.get("UploadFileExtBlockList")%>" />
												<tr>
													<td class="pe_eA"><input type="checkbox" id="UploadFileExtBlockListChecked" <%=settingValue.get("UploadFileExtBlockListChecked")%>/><span id="pe_pQ"></span></td>
												</tr>
												<tr>
													<td class="pe_eA"><textarea id="UploadFileExtBlockListTextarea" cols="70" rows="2"><%=settingValue.get("UploadFileExtBlockListTextarea")%></textarea><br /><span id="pe_Db"></span></td>
												</tr>	
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Jc"></span></b></td>
										<td class="pe_fy"></td>
										<td >
											<table class="pe_fa">
												<input type="hidden" name="AttributeBlockList" value="<%=settingValue.get("AttributeBlockList")%>" />
												<tr>
													<td class="pe_eA"><input type="checkbox" id="AttributeBlockListChecked" <%=settingValue.get("AttributeBlockListChecked")%>/><span id="pe_pQ"></span></td>
												</tr>
												<tr>
													<td class="pe_eA"><textarea id="AttributeBlockListTextarea" cols="70" rows="2"><%=settingValue.get("AttributeBlockListTextarea") %></textarea><br /><span id="pe_yo"></span></td>
												</tr>	
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Lu"></span></b></td>
										<td class="pe_fy"></td>
										<td >
											<table class="pe_fa">
												<input type="hidden" name="TagBlockList" value="<%=settingValue.get("TagBlockList")%>" />
												<tr>
													<td class="pe_eA"><input type="checkbox" id="TagBlockListChecked" <%=settingValue.get("TagBlockListChecked")%>/><span id="pe_pQ"></span></td>
												</tr>
												<tr>
													<td class="pe_eA"><textarea id="TagBlockListTextarea" cols="70" rows="2"><%=settingValue.get("TagBlockListTextarea") %></textarea><br /><span id="pe_yo"></span></td>
												</tr>	
											</table>
										</td>
									</tr>

									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
								</table>
								
							</td>
						</tr>

												
						

					</tr> 						
						<tr>
							<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_Li"></span></font></td>
						</tr>

						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
								
								<table class="pe_fa" >
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Mo"></span></b></td>
										<td class="pe_fy"></td>
										<td>
											<table class="pe_fa">
												<input type="hidden" name="Template" id="Template" value="<%=settingValue.get("Template")%>" />
												<tr>
													<td class="pe_eA"><input type="button" id="pe_aLw" value="+" onClick="pe_ae(this)"/></td>
													<td class="pe_eA">&nbsp;</td>
													<td class="pe_eA">&nbsp;</td>
												</tr>
												<tr style="background-color:#B2EBF4;">
													<td class="pe_eA"><b>Title</b></td>
													<td class="pe_eA"><b>URL</b></td>
													<td class="pe_eA"><b>Encoding</b></td>
												</tr>
						
											<%	
											
											for(int i=0; i<TemplateListArr.length ; i++){
												String templateName;
												String templateUrl;
												String templateEncoding;
												if(TemplateListArr[i] == null || TemplateListArr[i] == ""){
													templateName = "";
													templateUrl = "";
													templateEncoding = "";
												}else{
													templateName = TemplateListArr[i].split("\\|")[0];
													templateUrl = TemplateListArr[i].split("\\|")[1];							
													templateEncoding = TemplateListArr[i].split("\\|")[2];

													%>
														<tr>
															<td><input type="text"  name="pe_ajE"  value="<%=templateName %>" style="width:100px"/></td>
															<td><input type="text"  name="pe_aon"  value="<%=templateUrl %>" style="width:320px"/></td>
															<td><input type="text"  name="pe_anR"  value="<%=templateEncoding %>" style="width:90px"/><input type="button" value="-" onclick="pe_E(this)"/></td>
						
														</tr>
													<% 
												}
												
											
											}
											%>
											</table>
										</td>
									</tr>


									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
								</table>
								
							</td>
						</tr>

						
						
					</table>
				</div>	
				
			</td>
		</tr>	
		
		

		<tr>
			<td class="pe_jq">
				<div id="pe_agV">
					<table class="pe_wn">
						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
								
								<table class="pe_fa">
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Kd"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<table>
											<tr>
											<td>
											<input type="text" id="pe_ade" class="color{hash:true,valueElement:'FontColor',pickerFaceColor:'transparent',pickerFace:3,pickerBorder:0,pickerInsetColor:'black'}" style="width:20px;"></td>
											<td><input id="FontColor" name="FontColor" value="<%=settingValue.get("FontColor") %>"></td>
											<td style="padding-left:0px">
											<ul style="width:140px;">
											<li class="pe_jw">
											<input type="button" class="pe_iD pe_gk" value="default" style="width:80px;height:26px;" onclick="document.getElementById('pe_ade').color.fromString('#000000');">
											</li>
											</ul></td>
											</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_JN"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
										<textarea name="FontSizeList" id="FontSizeList" cols="70" rows="2"><%=settingValue.get("FontSizeList") %></textarea></td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_KY"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
										<textarea name="LineHeightList" id="LineHeightList" cols="70" rows="2"><%=settingValue.get("LineHeightList") %></textarea>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_LT"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="IndentPaddingValue" name="IndentPaddingValue" class="inputStyleChange" maxlength="3" value="<%=settingValue.get("IndentPaddingValue") %>" style="width:30px;" /> px 
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<input type="hidden" name="ReturnKeyActionBR">
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_La"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA"><input type="checkbox" id="ReturnKeyActionBRChecked" <%=settingValue.get("ReturnKeyActionBRChecked")%>/><label for="ReturnKeyActionBR"><span id="pe_LD"></span></label></td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>

									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_NW"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="DefaultFont" name="DefaultFont" class="inputStyleChange" maxlength="30" value="<%=settingValue.get("DefaultFont") %>" style="width:170px;" /> 
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Qf"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="DefaultFontSize" name="DefaultFontSize" class="inputStyleChange" maxlength="5" value="<%=settingValue.get("DefaultFontSize") %>" style="width:30px;" />
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Oa"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="Placeholder" name="Placeholder" class="inputStyleChange" maxlength="200" value="<%=settingValue.get("Placeholder") %>" style="width:443px;" /> 
										</td>
									</tr>

									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>


								</table>


								<table class="pe_fa">
									<tr>
										<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_At"></span></font></td>
									</tr>

									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Ls"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<table>
											<tr>
											<td>
											<input type="text" id="pe_ahJ" class="color{hash:true,valueElement:'ImgLineColor',pickerFaceColor:'transparent',pickerFace:3,pickerBorder:0,pickerInsetColor:'black'}" style="width:20px;"></td>
											<td><input id="ImgLineColor" name="ImgLineColor" value="<%=settingValue.get("ImgLineColor") %>"></td>
											<td style="padding-left:0px">
											<ul style="width:140px;">
											<li class="pe_jw">
											<input type="button" class="pe_iD pe_gk" value="default" style="width:80px;height:26px;" onclick="document.getElementById('pe_ahJ').color.fromString('#000000');">
											</li>
											</ul></td>
											</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
								</table>



								<table class="pe_fa">				
									<tr>
										<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_LN"></span></font></td>
									</tr>

									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Lg"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<table>
											<tr>
											<td>
											<input type="text" id="pe_ahf" class="color{hash:true,valueElement:'TableLineColor',pickerFaceColor:'transparent',pickerFace:3,pickerBorder:0,pickerInsetColor:'black'}" style="width:20px;"></td>
											<td><input id="TableLineColor" name="TableLineColor" value="<%=settingValue.get("TableLineColor") %>"></td>
											<td style="padding-left:0px">
											<ul style="width:140px;">
											<li class="pe_jw">
											<input type="button" class="pe_iD pe_gk" value="default" style="width:80px;height:26px;" onclick="document.getElementById('pe_ahf').color.fromString('#000000');">
											</li>
											</ul></td>
											</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_KT"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<table>
											<tr>
											<td>
											<input type="text" id="pe_agO" class="color{hash:true,valueElement:'TableBGColor',pickerFaceColor:'transparent',pickerFace:3,pickerBorder:0,pickerInsetColor:'black'}" style="width:20px;"></td>
											<td><input id="TableBGColor" name="TableBGColor" value="<%=settingValue.get("TableBGColor") %>"></td>
											<td style="padding-left:0px">
											<ul style="width:140px;">
											<li class="pe_jw">
											<input type="button" class="pe_iD pe_gk" value="default" style="width:80px;height:26px;" onclick="document.getElementById('pe_agO').color.fromString('#FFFFFF');">
											</li>
											</ul></td>
											</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
								</table>

	
											
							</td>
						</tr>
					</table>
				</div>	
			</td>
		</tr>

		
		
		<tr>
			<td class="pe_jq">
				<div id="pe_afU">
					<table class="pe_wn">
						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
								 
								<table class="pe_fa">
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_KM"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<% out.println(skinDirectory(fileRealFolder, (String)settingValue.get("Skin"))); %>
										</td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_RZ"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<% out.println(iconColorSelect((String)settingValue.get("IconColor"))); %>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Dr"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="Css" name="Css" class="pe_mP" value="<%=settingValue.get("Css")%>" />  ex) http://www.mysite.com/common.css 
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_KU"></span></b>
											<input type="hidden" id="UserSkinColor" name="UserSkinColor" value="<%=settingValue.get("UserSkinColor")%>" />
										</td>
											
										<td class="pe_fy"></td>
										<td >
											<table class="pe_fa">
												<tr>
													<td class="pe_wk">&nbsp;&nbsp;<span id="pe_Mh"></span></td>
													<td class="pe_fy"></td>
													<td class="pe_eA">
														<input type="text" id="outlinecolor" name="outlinecolor" class="pe_wI" value="" />  ex) #000000 or black 
													</td>
												</tr>
												<tr>
													<td class="pe_eB" colspan="3"></td>
												</tr>
												
												<tr>
													<td class="pe_wk">&nbsp;&nbsp;<span id="pe_Mv"></span></td>
													<td class="pe_fy"></td>
													<td class="pe_eA">
														<input type="text" id="innerlineColor" name="innerlineColor" class="pe_wI" value="" />
													</td>
												</tr>
												<tr>
													<td class="pe_eB" colspan="3"></td>
												</tr>
												<tr>
													<td class="pe_wk">&nbsp;&nbsp;<span id="pe_JO"></span></td>
													<td class="pe_fy"></td>
													<td class="pe_eA">
														<input type="text" id="skinfontColor" name="skinfontColor" class="pe_wI" value="" />
													</td>
												</tr>
												<tr>
													<td class="pe_eB" colspan="3"></td>
												</tr>
												<tr>
													<td class="pe_wk">&nbsp;&nbsp;<span id="pe_LV"></span></td>
													<td class="pe_fy"></td>
													<td class="pe_eA">
														<input type="text" id="toolbarBackgroundColor" name="toolbarBackgroundColor" class="pe_wI" value="" />
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_JG"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="hidden" id="CreateTab" name ="CreateTab" value="<%=settingValue.get("CreateTab")%>" />
											<input type="checkbox" id="pe_Fr" name="pe_wE" value="0" /><label for="pe_Fr"><span id="wysiwyg"></span></label>&nbsp;&nbsp;
											<input type="checkbox" id="pe_DY" name="pe_wE" value="1" /><label for="pe_DY"><span id="html"></span></label>&nbsp;&nbsp;
											<input type="checkbox" id="pe_Gg" name="pe_wE" value="2" /><label for="pe_Gg"><span id="preview"></span></label>
										</td>
									</tr>
								</table>
									
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
							</td>
						</tr>

						<tr>
							<td class="pe_nt pe_jd"><font style="font-size:9pt;color:#FF9F4B;font-weight:bold;"><span id="pe_KK"></span></font></td>
						</tr>
						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
									
								<table class="pe_fa">
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_KV"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<select name='UserToolbar' id='UserToolbar' class="inputSelectStyle">
												<option value='false' <% if(settingValue.get("UserToolbar").equals("false")) out.println("selected=\"selected\"");%>>false</option>
												<option value='true' <% if(settingValue.get("UserToolbar").equals("true")) out.println("selected=\"selected\"");%>>true</option>
											</select>
											<input type="hidden" id="CreateToolbar" name="CreateToolbar" value="<%=settingValue.get("CreateToolbar")%>" >
											<input type="hidden" id="Name" name="Name" value="<%=settingValue.get("Name")%>">
											<input type="hidden" id="Logo" name="Logo" value="<%=settingValue.get("Logo")%>">
											<input type="hidden" id="Help" name="Help" value="<%=settingValue.get("Help")%>">
											<input type="hidden" id="Info" name="Info" value="<%=settingValue.get("Info")%>">
											<input type="hidden" id="UserAddMenu" name="UserAddMenu" value="<%=userAddMenuList%>" />
											<input type="hidden" id="AddMenuCheck" name="AddMenuCheck" value="<%=settingValue.get("AddMenuCheck")%>" />
											<input type="hidden" id="Tab" name="Tab" value="" />

											<input type="hidden" id="UploadFileViewer" name="UploadFileViewer" value="<%=settingValue.get("UploadFileViewer")%>" />
											<input type="hidden" id="UploadFileSizeLimit" name="UploadFileSizeLimit" value="<%=settingValue.get("UploadFileSizeLimit")%>" />
											<input type="hidden" id="ProfanityStr" name="ProfanityStr" value="<%=settingValue.get("ProfanityStr")%>" />
											<input type="hidden" id="Csslist" name="Csslist" value="<%=settingValue.get("Csslist")%>" />
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
										
								</table>	
							</td>		
						</tr>			
					</table>

					<div id="pe_XF">
						<table class="pe_po">
							<tr>
								<td>
									<table class="pe_fa">
										<tr>
											<td class="pe_eB" colspan="5"></td>
										</tr>
										<tr>
											<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Lf"></span></b></td>
											<td class="pe_fy"></td>
											<td>
												<table class="pe_fa">
													<tr>
														<td class="pe_vD" >&nbsp;&nbsp;<span id="pe_Ma"></span></td>
														<td class="pe_fy"></td>
														<td class="pe_eA">
															<input type="text" id="AdminPageUserMenuIdInput" name="AdminPageUserMenuIdInput" class="pe_mP" value="" /> 
														</td>
													</tr>
													<tr>
														<td class="pe_eB" colspan="3"></td>
													</tr>
													<tr>
														<td class="pe_vD">&nbsp;&nbsp;<span id="pe_KO"></span></td>
														<td class="pe_fy"></td>
														<td class="pe_eA">
															<input type="radio" name="AdminPageUserMenuPlayKindRadio" id="pe_Nz" value="function" /><label for="pe_Nz"><span id="pe_LQ"></span></label>&nbsp;&nbsp;<input type="radio" name="AdminPageUserMenuPlayKindRadio" id="pe_NY" value="plugin" /><label for="pe_NY"><span id="pe_Ly"></span></label>
														</td>
													</tr>
													<tr>
														<td class="pe_eB" colspan="3"></td>
													</tr>
													<tr>
														<td class="pe_vD">&nbsp;&nbsp;<span id="pe_Ms"></span></td>
														<td class="pe_fy"></td>
														<td class="pe_eA" height="50px">
															<input type="text" id="AdminPageUserMenuButtonImgPathInput" name="AdminPageUserMenuButtonImgPathInput" class="pe_mP" value="" />
															<br/>ex) http://www.mysite.com/image/MenuIcon.jpg
														</td>
													</tr>
													<tr>
														<td class="pe_eB" colspan="3"></td>
													</tr>
													<tr>
														<td class="pe_vD">&nbsp;&nbsp;<span id="pe_Lm"></span></td>
														<td class="pe_fy"></td>
														<td class="pe_eA">	
															<input type="text" id="AdminPageUserMenuTitleInput" name="AdminPageUserMenuTitleInput" class="pe_mP" value="" />
														</td>
													</tr>
												</table>
											</td>
											<td class="pe_fy"></td>
											<td style="text-align:center;vertical-align:middle;"><input type="button" id="pe_EN" value="" class="" style="width:60px;height:60px;"/>
											</td>
										</tr>
										<tr>
											<td class="pe_eB" colspan="5"></td>
										</tr>
										<tr>
											<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_Le"></span></b></td>
											<td class="pe_fy"></td>
											<td class="pe_eA" colspan="2">
												<div id="pe_aBM">&nbsp;</div>
											</td>
										</tr>
										<tr>
											<td class="pe_eB" colspan="5"></td>
										</tr>
									</table>	
								</td>		
							</tr>
						</table>
					</div>
		
					<div id = "pe_fa">
						
						<table class="pe_po">	
							<tr>
								<td id="pe_WQ" class="pe_jd">
									
									<table>
										<tr>
											<td id="pe_aJO">
												<span id="pe_JH"></span>: <br>
												<div id="pe_akf" >
													<span id="pe_yD"></span> <br> 
													<span id="pe_DF"></span><br>
													<span id="pe_Ae"></span><br>
												</div>
											</td>
											<td id="pe_azB">
											<span id="pe_LJ"></span>:<br>
												<div id="pe_adG" ></div>
											</td> 
											<td valign="bottom">
												<ul style="margin:0 auto;width:340px;">
													<li class="pe_jw">
														<input type="button" id="spacebar" value="" class="pe_iD pe_gk" style="width:80px;height:26px;" />
													</li>
													<li class="pe_jw"><input type="button" id="space" value="" class="pe_iD pe_gk" style="width:68px;height:26px;"></li>
													<li class="pe_jw"><input type="button" id="enter" value="" class="pe_iD pe_gk" style="width:66px;height:26px;"></li>
												</ul>
											</td>
										</tr>
										<tr>
											<td colspan="3">
												<br />
												<span id="pe_Kq"></span>
											</td>
										</tr>	
									</table>							
								</td>
							</tr>
							<tr>
								<td>
									<table class="pe_fa">
										<tr><td class="pe_iq" colspan="3"></td></tr>
									</table>
								</td>
							</tr>
						</table>	
				
						<table id="pe_kn" class="pe_po">
							
							<tr>
								<td id="pe_WQ" class="pe_jd">
									<span id="preview"></span>:<br>
									<div id="pe_akL"></div>
									<br />
									<span id="pe_JE"></span>
								</td>
							</tr>
						</table>
						
					
					
					

					</div>
				</div>	

			</td>
		</tr>
		<tr>
			<td class="pe_jq">
				<div id="pe_agl">
					<table class="pe_wn">
						<tr>
							<td>
								<table class="pe_fa"><tr><td class="pe_iq" colspan="3"></td></tr>
								</table>
								 
								<table class="pe_fa">
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_IU"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="text" id="DocTitle" name="DocTitle" class="pe_mP" value="<%=settingValue.get("DocTitle")%>" />
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
									<tr>
										<td class="pe_er">&nbsp;&nbsp;&nbsp;&nbsp;<b><span id="pe_IT"></span></b></td>
										<td class="pe_fy"></td>
										<td class="pe_eA">
											<input type="hidden" id="AccessibilityOption" name ="AccessibilityOption" value="<%=settingValue.get("AccessibilityOption")%>" />
											<input type="radio" id="pe_NG" name="pe_CT" value="0" /><label for="pe_NG"><span id="pe_IZ"></span></label>&nbsp;&nbsp;
											<input type="radio" id="pe_Qh" name="pe_CT" value="1" /><label for="pe_Qh"><span id="pe_Jx"></span></label>&nbsp;&nbsp;
											<input type="radio" id="pe_Sb" name="pe_CT" value="2" /><label for="pe_Sb"><span id="pe_Kp"></span></label>
										</td>
									</tr>
									<tr>
										<td class="pe_eB" colspan="3"></td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>
</table>

<table class="pe_wT">
	<tr id="pe_So">
		<td id="pe_TL">
			<ul style="margin:0 auto;width:170px;">
				<li class="pe_jw">
					<input type="submit" id="pe_MN" value="" class="pe_iD pe_gk" style="width:66px;height:26px;" />
				</li>
				<li class="pe_jw"><input type="button" id="pe_DU" value="" class="pe_iD pe_gk" style="width:66px;height:26px;"></li>
			</ul>
		</td>
	</tr>
</table>
	
</div>



<input type="hidden" id="CanvasWidth" name="CanvasWidth" value="<%=settingValue.get("CanvasWidth")%>" />
<input type="hidden" id="CanvasHeight" name="CanvasHeight" value="<%=settingValue.get("CanvasHeight")%>" />
<input type="hidden" id="MenuInEditor" name="MenuInEditor" value="<%=settingValue.get("MenuInEditor")%>" />
<input type="hidden" id="LimitClipboardNodeCount" name="LimitClipboardNodeCount" value="<%=settingValue.get("LimitClipboardNodeCount")%>" />

<input type="hidden" id="ContextMenuPasteText" name="ContextMenuPasteText" value="<%=settingValue.get("ContextMenuPasteText")%>" />
<input type="hidden" id="RemoveScriptBlock" name="RemoveScriptBlock" value="<%=settingValue.get("RemoveScriptBlock")%>" />
<input type="hidden" id="ClipBoardFontFamily" name="ClipBoardFontFamily" value="<%=settingValue.get("ClipBoardFontFamily")%>" />
<input type="hidden" id="ClipBoardFontSize" name="ClipBoardFontSize" value="<%=settingValue.get("ClipBoardFontSize")%>" />
<input type="hidden" id="MSOfficeTranON" name="MSOfficeTranON" value="<%=settingValue.get("MSOfficeTranON")%>" />
<input type="hidden" id="DefaultDocType" name="DefaultDocType" value="<%=settingValue.get("DefaultDocType")%>" />
<input type="hidden" id="ShowRuler" name="ShowRuler" value="<%=settingValue.get("ShowRuler")%>" />
<input type="hidden" id="Version" name="Version" value="<%=settingValue.get("Version")%>" />
<input type="hidden" id="Version_daemon" name="Version_daemon" value="<%=settingValue.get("Version_daemon")%>" />
<input type="hidden" id="Version_com" name="Version_com" value="<%=settingValue.get("Version_com")%>" />

</form>
<%@include file = "../include/bottom.html"%>
<script>var webPageKind='<%=detectXSSEx(session.getAttribute("webPageKind").toString())%>';var encodingStyleChecked='<%=encodingStyleValue%>';topInit();managerInit('<% if(detectXSSEx(request.getParameter("Tab")) != null) out.print(detectXSSEx(request.getParameter("Tab")));%>'); </script>

</body> 
</html>