<%@page contentType="text/html;charset=utf-8" %>
<%@page import="java.io.*"%>
<%@page import="java.util.regex.PatternSyntaxException"%>
<%@page import="java.net.*"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Iterator"%>
<%@page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%>
<%@page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%>
<%@page import="org.apache.commons.fileupload.FileItem"%>
<%@page import="org.apache.commons.fileupload.FileUploadBase"%>
<%@page import="org.apache.commons.codec.binary.Base64"%>
<%@include file="Util.jsp"%>
<%@include file="SecurityTool.jsp"%>
<%--@include file="Vaccine.jsp"--%>
<%
	
	/*
	if(detectXSSEx(request.getParameter("licenseCheck")) != null){
		if(detectXSSEx(request.getParameter("licenseCheck")).toLowerCase().equalsIgnoreCase("true")){
			out.println(InetAddress.getLocalHost().getHostAddress());
			return;
		}
	}
	*/

	boolean isMultipart = ServletFileUpload.isMultipartContent(request);
	DiskFileItemFactory factory = null;
	ServletFileUpload upload = null;
	List items = null;
	//try {
		
		if (isMultipart) {
			factory = new DiskFileItemFactory();                             
			factory.setSizeThreshold(2 * 1024 * 1024); 
			upload = new ServletFileUpload(factory);  
			upload.setSizeMax(-1); 
			upload.setHeaderEncoding("utf-8");
			items = upload.parseRequest(request);       
		}else{
			response.getWriter().println("not encoding type multipart/form-data");
		}

    //} catch (Exception e) {
	//	response.getWriter().println("not encoding type multipart/form-data");
	//	return;
	//}

	String messageText = "";
	int maxSize = Integer.parseInt(detectXSSEx(request.getParameter("fileSizeLimit")));
	String defaultUPath = detectXSSEx(request.getParameter("defaultUPath"));
	String imageUPath = detectXSSEx(request.getParameter("fileUPath"));

	String protocol = "http://";
	if(request.isSecure()){
		protocol = "https://";
	}
	String fileUPathHost = protocol + detectXSSEx(request.getHeader("host"));

	String imagePhysicalPath = "";
	String useExternalServer =  detectXSSEx(request.getParameter("useExternalServer"));

	String uploadFileExtBlockList = "";

	//2018-11-20[4.2.0.12]vaccine로직 주석(수정된 빌드로 나갈 때 추가)
	//String strVaccinePath = "";
%>
<%--@include file="VaccinePath.jsp"--%>
<%@include file="ImagePath.jsp"%>
<%@include file="UploadFileExtBlockList.jsp"%>
<%
	String fileModify = ""; 
	if ( detectXSSEx(request.getParameter("filemodify")) != null)
		fileModify =  detectXSSEx(request.getParameter("filemodify"));
	
	String fileEditorFlag = "";
	if ( detectXSSEx(request.getParameter("fileEditorFlag")) != null)
		fileEditorFlag =  detectXSSEx(request.getParameter("fileEditorFlag"));
	
	String uploadFileSubDir = "";
	if ( detectXSSEx(request.getParameter("uploadFileSubDir")) != null)
		uploadFileSubDir =  detectXSSEx(request.getParameter("uploadFileSubDir"));
	
	String fileDomain = ""; 
	if ( detectXSSEx(request.getParameter("fileDomain")) != null)
		fileDomain =  detectXSSEx(request.getParameter("fileDomain"));
/*
	String useExternalServer = "";
	if ( detectXSSEx(request.getParameter("useExternalServer")) != null)
		useExternalServer =  detectXSSEx(request.getParameter("useExternalServer"));
*/
	String checkPlugin = "false";
	String fileTemp = "";
	String scriptValue = "";
	String saveFolder = "";
	String returnParam ="";
	String ContextPath = request.getContextPath();
	String fileSize = "";
	String tempFileName = "";
	
	ServletContext context = getServletConfig().getServletContext();

	if (!imageUPath.equalsIgnoreCase("")) {
		if (imageUPath.length() > 7) {
			if (imageUPath.substring(0, 7).equalsIgnoreCase("http://")) {
				fileTemp = imageUPath.substring(7);
				imageUPath = fileTemp.substring(fileTemp.indexOf("/"));
				fileUPathHost = "http://" + fileTemp.substring(0, fileTemp.indexOf("/"));
			}
			else if (imageUPath.substring(0, 8).equalsIgnoreCase("https://")) {
				fileTemp = imageUPath.substring(8);
				imageUPath = fileTemp.substring(fileTemp.indexOf("/"));
				fileUPathHost = "https://" + fileTemp.substring(0, fileTemp.indexOf("/"));
			}
			else if (!imageUPath.substring(0, 1).equalsIgnoreCase("/")) {
				scriptValue = executeFileScript(response, "invalid_path", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
		} else {
			if (!imageUPath.substring(0, 1).equalsIgnoreCase("/")) {
				scriptValue = executeFileScript(response, "invalid_path", "" , useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
		}
	} else {
		if (defaultUPath.length() > 7) {
			if (defaultUPath.substring(0, 7).equalsIgnoreCase("http://")) {
				fileTemp = defaultUPath.substring(7);
				imageUPath = fileTemp.substring(fileTemp.indexOf("/"));
			}
			else if (defaultUPath.substring(0, 8).equalsIgnoreCase("https://")) {
				fileTemp = defaultUPath.substring(8);
				imageUPath = fileTemp.substring(fileTemp.indexOf("/"));
			} else if (defaultUPath.substring(0, 1).equalsIgnoreCase("/"))
				imageUPath = defaultUPath;
			else {
				scriptValue = executeFileScript(response, "invalid_path", "" , useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
		} else {
			if (defaultUPath.substring(0, 1).equalsIgnoreCase("/"))
				imageUPath = defaultUPath;
			else {
				scriptValue = executeFileScript(response, "invalid_path", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
		}
	}

	if (imageUPath.length() > 0 && imageUPath.lastIndexOf("/") != imageUPath.length() - 1)
		imageUPath = imageUPath + "/";

	if (imagePhysicalPath.equalsIgnoreCase("")) {
		String DompaserValue = dompaser(imageUPath);
		if (DompaserValue.equalsIgnoreCase("")) {
			imagePhysicalPath = context.getRealPath(imageUPath);

			// 2013.08.26 [2.0.5.23] mwhong tomcat8.0
			if(imagePhysicalPath == null && imageUPath != null && ContextPath != null){
				imagePhysicalPath = context.getRealPath(imageUPath.substring(ContextPath.length()));
			}

			if (!ContextPath.equalsIgnoreCase("") && !ContextPath.equalsIgnoreCase("/")) {
				File tempFileRealDIR = new File(imagePhysicalPath);
				if (!tempFileRealDIR.exists()){
					if (imageUPath.indexOf(ContextPath) != -1)
						imagePhysicalPath = context.getRealPath(imageUPath.substring(ContextPath.length()));
				}
			}
		}
		else
			imagePhysicalPath = DompaserValue;
	}
		
	File fileRealFolderWriteCheck = new File(imagePhysicalPath);
	if (!fileRealFolderWriteCheck.exists()) {
		scriptValue = executeFileScript(response, "invalid_path", "" , useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
		response.getWriter().println(scriptValue);
		return;
	}
	if (!fileRealFolderWriteCheck.canWrite()) {
		scriptValue = executeFileScript(response, "canWriteErr", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
		response.getWriter().println(scriptValue);
		return;
	}

	if (imagePhysicalPath.length() > 0 && imagePhysicalPath.lastIndexOf(File.separator) != imagePhysicalPath.length() - 1)
		imagePhysicalPath += File.separator;

	String filePhysicalPathsubFolder = imagePhysicalPath;
	File SaveSubFolder = new File(filePhysicalPathsubFolder + "upload");
	if(!SaveSubFolder.exists()){
		SaveSubFolder.setExecutable(false, true);
		SaveSubFolder.setReadable(true);
		SaveSubFolder.setWritable(false, true);

		boolean returnRes = SaveSubFolder.mkdir();
		if(returnRes == false && !SaveSubFolder.exists()){
			scriptValue = executeFileScript(response, "invalid_path", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
			response.getWriter().println(scriptValue);
			return;
		}
	}
	filePhysicalPathsubFolder += "upload" + File.separator;
	File DeleteTempFolder = null;
	
	try {
		String tempFileFolder = "";

		if (uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase(""))
			tempFileFolder = tempFolderCreate(imagePhysicalPath);
		else
			tempFileFolder = imagePhysicalPath;
					
		//boolean isMultipart = ServletFileUpload.isMultipartContent(request);
		if (isMultipart) {
			String realDir = filePhysicalPathsubFolder;
			//DiskFileItemFactory factory = new DiskFileItemFactory();                                   
			//factory.setSizeThreshold(2 * 1024 * 1024); 
			//ServletFileUpload upload = new ServletFileUpload(factory);                               
			//upload.setSizeMax(-1); 
			//upload.setHeaderEncoding("utf-8");
			//List items = upload.parseRequest(request);       
			Iterator iter=items.iterator();                                                                            

			
			String atchPsbltyFileCnt = "";
			String fileTitle = "";
			String fileSn = "";
			String fileClass = "";
			String fileKind = "";
			String fileTempFName = "";
			String fileUNameType = "";
			String editorFrame = "";
			String filename = "";
			String type = "";

			while(iter.hasNext()){
				FileItem fileItem = (FileItem) iter.next();    
				if(fileItem.isFormField()){          
						if( fileItem.getFieldName().equalsIgnoreCase("atchPsbltyFileCnt") ) atchPsbltyFileCnt =  detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("fileTitle") ) fileTitle = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("fileSn") ) fileSn = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("fileClass") ) fileClass = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("fileKind") ) fileKind = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("fileTempFName") ) fileTempFName = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("fileUNameType") ) fileUNameType = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("editorFrame") ) editorFrame = detectXSSEx(toString(fileItem.getString("utf-8")));
													
				} else { 
					if(fileItem.getSize()>0) {   
						fileSize = Long.toString(fileItem.getSize());
						if(fileItem.getSize() > maxSize){
							scriptValue = executeFileScript(response, "invalid_size", Integer.toString(maxSize), useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
		
							response.getWriter().println(scriptValue);
							return;
						}
						filename = fileItem.getName();
						filename = detectXSSEx(filename);
						if (filename.lastIndexOf("\\") != -1) {
							filename = filename.substring(filename.lastIndexOf("\\"), filename.length());
						}
						type = fileItem.getContentType();
						
						
						if (filename.toLowerCase().indexOf(".jar") != -1 || filename.toLowerCase().indexOf(".war") != -1 || filename.toLowerCase().indexOf(".jsp") != -1 || filename.toLowerCase().indexOf(".jspx") != -1 || filename.toLowerCase().indexOf(".js") != -1 || filename.toLowerCase().indexOf(".html") != -1 || filename.toLowerCase().indexOf(".htm") != -1) {
							//scriptValue = executeFileScript(response, "fail_image", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
							//scriptValue = executeFileScript(response, "invalid_file", "prohibited : jsp, js, html, htm", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
							// [4.0.0.22] [한국인터넷진흥원 보안 취약점] 제한된 확장자 목록 alert에 보이지 않도록 처리
							//scriptValue = executeFileScript(response, "fail_image", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
							scriptValue = executeFileScript(response, "UploadFileExtBlock", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
							response.getWriter().println(scriptValue);
							return;
						}

						try{
							tempFileName = filename;
							File uploadedFile = new File(realDir + tempFileName);
							if(uploadedFile.exists()){
								tempFileName = fileNameTimeSetting();
								uploadedFile = new File(realDir,tempFileName);
							}
							//File uploadedFile=new File(realDir,filename); 
							fileItem.write(uploadedFile);
							fileItem.delete(); 
							DeleteTempFolder = uploadedFile;
						}catch(IOException ex) {
							//System.out.println("An internal exception occured!");
							messageText = "upload fail";
						} 
					}
				}
			}
			String fileTempName = "";
			String fileKindSubFolder = ""; 

			fileKindSubFolder = "files";
			if (fileUNameType.equalsIgnoreCase("real")) 
				fileTempName = filename.substring(0, filename.lastIndexOf("."));
			else if(fileUNameType.equalsIgnoreCase("random"))
				fileTempName = fileNameTimeSetting();
			else {
				//fileTempName = fileTempFName;
				fileTempName = filename.substring(0, filename.lastIndexOf("."));
				//sun.misc.BASE64Encoder encoder = new sun.misc.BASE64Encoder();
				//byte[] keyByte = fileTempName.getBytes("utf-8");
				//fileTempName = encoder.encode(keyByte);
				//라이브러리 추가 요함 -> https://commons.apache.org/proper/commons-codec/download_codec.cgi
				byte[] encoded = Base64.encodeBase64(fileTempName.getBytes());
				fileTempName = new String(encoded, "ISO-8859-1");

				if (fileTempName.indexOf("/") != -1)
					fileTempName = fileTempName.replaceAll("/", "==NamOSeSlaSH=="); 
			}
			String realFileName = fileTempName.replace(' ', '_');
			String fileCheck =filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
			fileCheck = detectXSSEx(fileCheck);

			if(uploadFileExtBlockList.length() > 0 && !isArray(uploadFileExtBlockList, fileCheck)){
				scriptValue = executeFileScript(response, "UploadFileExtBlock", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
			 
/*
			if (!isImageValid("file", fileCheck)) {
				if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase(""))
					tempFolderDelete(tempFileFolder);

				scriptValue = executeFileScript(response, "invalid_file", getImageKind("file"), useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
*/
			if(uploadFileSubDir.equalsIgnoreCase("false")) { 
				if(imageUPath.equalsIgnoreCase("")) {
					File fileSaveSubFolder = new File(imagePhysicalPath + fileKindSubFolder);
					if(!fileSaveSubFolder.exists()){
						fileSaveSubFolder.setExecutable(false, true);
						fileSaveSubFolder.setReadable(true);
						fileSaveSubFolder.setWritable(false, true);

						boolean returnRes = fileSaveSubFolder.mkdir();
						if(returnRes == false){
							scriptValue = executeFileScript(response, "invalid_path", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
							response.getWriter().println(scriptValue);
							return;
						}
					}
					imagePhysicalPath += fileKindSubFolder + File.separator;
				}
			} else {
				File fileSaveSubFolder = new File(imagePhysicalPath + fileKindSubFolder);
				if(!fileSaveSubFolder.exists()){
					fileSaveSubFolder.setExecutable(false, true);
					fileSaveSubFolder.setReadable(true);
					fileSaveSubFolder.setWritable(false, true);

					boolean returnRes = fileSaveSubFolder.mkdir();
					if(returnRes == false){
						scriptValue = executeFileScript(response, "invalid_path", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
						response.getWriter().println(scriptValue);
						return;
					}
				}
				imagePhysicalPath += fileKindSubFolder + File.separator;

				saveFolder = getChildDirectory(imagePhysicalPath, atchPsbltyFileCnt);
				
				if (saveFolder.equalsIgnoreCase("")) {	
					if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
						boolean returnRes = tempFolderDelete(tempFileFolder);

						if(returnRes == false){
							messageText = "delete fail";
						}
					}

					scriptValue = executeFileScript(response, "invalid_path", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
					response.getWriter().println(scriptValue);
					return;
				} else
					imagePhysicalPath += saveFolder;	
			}

			realFileName = realFileName.replace('\\', ' ').trim();

			String filenamecheck = checkFileUniqueName(realFileName, imagePhysicalPath, fileCheck);

			String imgLinkParams = "";
			String urlFilePathNm = fileUPathHost + imageUPath;

			if(uploadFileSubDir.equalsIgnoreCase("false")) {
				if(imageUPath.equalsIgnoreCase(""))
					urlFilePathNm += fileKindSubFolder + File.separator;
			} else
				urlFilePathNm += fileKindSubFolder + File.separator + saveFolder + File.separator;
			urlFilePathNm = urlFilePathNm.replace('\\', '/');

            filenamecheck = filenamecheck.replace('\\', ' ').trim();

			urlFilePathNm += filenamecheck;
			imgLinkParams = urlFilePathNm;
	
			if (fileTitle == null)
				fileTitle ="";
			if (fileSn == null)
				fileSn ="";
			if (fileClass == null)
				fileClass = "";
			if (editorFrame == null)
				editorFrame = "";

			if (fileSize == null)
				fileSize = "";

			returnParam = "{";
			//returnParam += "\"fileURL\":\"" + urlFilePathNm.replaceAll("'", "\\\\\"") + "\",";
			returnParam += "\"fileURL\":\"" + urlFilePathNm + "\",";
			returnParam += "\"fileTitle\":\"" + fileTitle + "\",";
			returnParam += "\"fileSn\":\"" + fileSn + "\",";
			returnParam += "\"fileClass\":\"" + fileClass + "\",";
			returnParam += "\"fileKind\":\"" + fileKind + "\",";
			returnParam += "\"fileType\":\"" + fileCheck + "\",";
			returnParam += "\"fileSize\":\"" + fileSize + "\",";
			if (fileModify.equalsIgnoreCase("true"))
				returnParam += "\"fileModify\":\"true\",";
			returnParam += "\"editorFrame\":\"" + editorFrame + "\"";
			returnParam += "}";	
			
			String moveFilePathNm = imagePhysicalPath + File.separator + filenamecheck;
			int check = fileCopy(filePhysicalPathsubFolder + tempFileName, moveFilePathNm);

			if(DeleteTempFolder != null){
				boolean returnRes = DeleteTempFolder.delete();
				if(returnRes == false){
					messageText = "delete fail";
				}
			}

			if (check == 1) {

				//2018-11-20[4.2.0.12]vaccine로직 주석(수정된 빌드로 나갈 때 추가)
				/*
				if (strVaccinePath.length() <= 0) {
					strVaccinePath = imagePhysicalPath + "/../../../vse";
				}
 				String strName = checkVirusFile (moveFilePathNm, imagePhysicalPath + File.separator, strVaccinePath);
				*/

				if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
					boolean returnRes = tempFolderDelete(tempFileFolder);

					if(returnRes == false){
						messageText = "delete fail";
					}
				}
					
				if (SaveSubFolder.exists()){
					boolean returnRes = SaveSubFolder.delete();
					if(returnRes == false){
						messageText = "delete fail";
					}
				}
				
				//2018-11-20[4.2.0.12]vaccine로직 주석(수정된 빌드로 나갈 때 추가)
				/*
				if (strName.length() > 0) {
					String msg = "found virus (";
					msg += strName + ")";
					scriptValue = executeFileScript(response, "virus", msg, useExternalServer, fileDomain, fileEditorFlag, "false");	
					response.getWriter().println(scriptValue);
					return;
				}
				*/
				
				scriptValue = executeFileScript(response, "success", returnParam, useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			} else {
				if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
					boolean returnRes = tempFolderDelete(tempFileFolder);

					if(returnRes == false){
						messageText = "delete fail";
					}
				}

				scriptValue = executeFileScript(response, "fileCopyFail", "", useExternalServer, fileDomain, fileEditorFlag, checkPlugin);	
				response.getWriter().println(scriptValue);
				return;			
			}
		}else{
			response.getWriter().println("not encoding type multipart/form-data");
		}
	} catch (IOException ioe) {
		scriptValue = executeFileScript(response, "invalid_size", Integer.toString(maxSize), useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
		
		response.getWriter().println(scriptValue);
		return;
	} catch (org.apache.commons.fileupload.FileUploadBase.SizeLimitExceededException e) {
		scriptValue = executeFileScript(response, "invalid_size", Integer.toString(maxSize), useExternalServer, fileDomain, fileEditorFlag, checkPlugin);

        response.getWriter().println(scriptValue);
		return;
    } catch (RuntimeException e) {	
		messageText += "RuntimeException";
		messageText = "<System Error>" + messageText;
		
		scriptValue = executeFileScript(response, "", messageText, useExternalServer, fileDomain, fileEditorFlag, checkPlugin);
		response.getWriter().println(scriptValue);
		return;
	}

%>
