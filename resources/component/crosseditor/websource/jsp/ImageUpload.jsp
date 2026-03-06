<%@page contentType="text/html;charset=utf-8" %>
<%@ taglib prefix="c" uri="/WEB-INF/tld/c.tld"  %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@page import="java.util.regex.PatternSyntaxException"%>
<%@page import="java.io.*"%>
<%@page import="java.net.*"%>
<%@page import="java.awt.*"%>
<%@page import="javax.swing.ImageIcon"%>
<%@page import="java.util.List"%>
<%@page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%>
<%@page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%>
<%@page import="org.apache.commons.fileupload.FileItem"%>
<%@page import="org.apache.commons.fileupload.FileUploadBase"%>
<%@page import="org.apache.commons.codec.binary.Base64"%>
<%@include file="Util.jsp"%>
<%@include file="SecurityTool.jsp"%>
<%--@include file="Vaccine.jsp"--%>
<%@page import="javax.imageio.*"%>
<%@page import="javax.imageio.stream.ImageInputStream"%>
<%@page import="javax.imageio.stream.FileImageInputStream"%>
<spring:eval var="safeExtensions" expression="@config['safe.extension']"/>

<%!
public Dimension getImageDim(final String path) {
    Dimension result = null;
    String suffix = this.getFileSuffix(path);
    Iterator<ImageReader> iter = ImageIO.getImageReadersBySuffix(suffix);
    if (iter.hasNext()) {
        ImageReader reader = iter.next();
		ImageInputStream stream = null;
		boolean exceptionCheck = false;
        try {
            stream = new FileImageInputStream(new File(path));
            reader.setInput(stream);
            int width = reader.getWidth(reader.getMinIndex());
            int height = reader.getHeight(reader.getMinIndex());
            result = new Dimension(width, height);
        } catch (IOException e) {
            result = null;
        } finally {
			try {
				if(stream != null){
					stream.close();
				}
			} catch (IOException e) {
				 result = null;
        	}

			if(reader != null){
				reader.dispose();
			}
        }
    }
    return result;
}
private String getFileSuffix(final String path) {
    String result = null;
    if (path != null) {
        result = "";
        if (path.lastIndexOf('.') != -1) {
            result = path.substring(path.lastIndexOf('.'));
            if (result.charAt(0) == '.') {
                result = result.substring(1);
            }
        }
    }
    return result;
}
%>

<%
	/*
	if(detectXSSEx(request.getParameter("licenseCheck")) != null){
		if(detectXSSEx(request.getParameter("licenseCheck")).toLowerCase().equalsIgnoreCase("true")){
			response.getWriter().println(InetAddress.getLocalHost().getHostAddress());
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
	int maxSize = 5242880;
	if(request.getParameter("imageSizeLimit") != null){
		maxSize = Integer.parseInt(detectXSSEx(request.getParameter("imageSizeLimit")));
	}
	String defaultUPath = detectXSSEx(request.getParameter("defaultUPath"));
	String imageUPath = detectXSSEx(request.getParameter("imageUPath"));

	String protocol = "http://";
	if(request.isSecure()){
		protocol = "https://";
	}

	String imageUPathHost = protocol + detectXSSEx(request.getHeader("host"));

	String imagePhysicalPath = "";
	String useExternalServer = detectXSSEx(request.getParameter("useExternalServer"));

	String uploadFileExtBlockList = "";

	//2018-11-20[4.2.0.12]vaccine로직 주석(수정된 빌드로 나갈 때 추가)
	//String strVaccinePath = "";
%>
<%--@include file="VaccinePath.jsp"--%>
<%@include file="ImagePath.jsp"%>
<%@include file="UploadFileExtBlockList.jsp"%>
<%
	String imageModify = "";
	if (detectXSSEx(request.getParameter("imagemodify")) != null)
		imageModify = detectXSSEx(request.getParameter("imagemodify"));

	String imageEditorFlag = "";
	if (detectXSSEx(request.getParameter("imageEditorFlag")) != null)
		imageEditorFlag = detectXSSEx(request.getParameter("imageEditorFlag"));

	String uploadFileSubDir = "";
	if (detectXSSEx(request.getParameter("uploadFileSubDir")) != null)
		uploadFileSubDir = detectXSSEx(request.getParameter("uploadFileSubDir"));

	String imageDomain = "";
	if (detectXSSEx(request.getParameter("imageDomain")) != null)
		imageDomain = detectXSSEx(request.getParameter("imageDomain"));
/*
	String useExternalServer = "";
	if (detectXSSEx(request.getParameter("useExternalServer")) != null)
		useExternalServer = detectXSSEx(request.getParameter("useExternalServer"));
*/
	String checkPlugin = "";
	if (detectXSSEx(request.getParameter("checkPlugin")) != null)
		checkPlugin = detectXSSEx(request.getParameter("checkPlugin"));

	String fileTypeNm = "";
	if (detectXSSEx(request.getParameter("fileTypeNm")) != null)
		fileTypeNm = detectXSSEx(request.getParameter("fileTypeNm"));

	String imageTemp = "";
	String scriptValue = "";
	String saveFolder = "";
	String returnParam ="";
	String ContextPath = request.getContextPath();
	String tempFileName = "";

	ServletContext context = getServletConfig().getServletContext();

	if (!imageUPath.equalsIgnoreCase("")) {
		if (imageUPath.length() > 7) {
			if (imageUPath.substring(0, 7).equalsIgnoreCase("http://")) {
				imageTemp = imageUPath.substring(7);
				imageUPath = imageTemp.substring(imageTemp.indexOf("/"));
				imageUPathHost = "http://" + imageTemp.substring(0, imageTemp.indexOf("/"));
			}
			else if (imageUPath.substring(0, 8).equalsIgnoreCase("https://")) {
				imageTemp = imageUPath.substring(8);
				imageUPath = imageTemp.substring(imageTemp.indexOf("/"));
				imageUPathHost = "https://" + imageTemp.substring(0, imageTemp.indexOf("/"));
			}
			else if (!imageUPath.substring(0, 1).equalsIgnoreCase("/")) {
				scriptValue = executeScript(response, "invalid_path", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				return;
			}
		} else {
			if (!imageUPath.substring(0, 1).equalsIgnoreCase("/")) {
				scriptValue = executeScript(response, "invalid_path", "" , useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				return;
			}
		}
	} else {
		if (defaultUPath.length() > 7) {
			if (defaultUPath.substring(0, 7).equalsIgnoreCase("http://")) {
				imageTemp = defaultUPath.substring(7);
				imageUPath = imageTemp.substring(imageTemp.indexOf("/"));
			}
			else if (defaultUPath.substring(0, 8).equalsIgnoreCase("https://")) {
				imageTemp = defaultUPath.substring(8);
				imageUPath = imageTemp.substring(imageTemp.indexOf("/"));
			} else if (defaultUPath.substring(0, 1).equalsIgnoreCase("/"))
				imageUPath = defaultUPath;
			else {
				scriptValue = executeScript(response, "invalid_path", "" , useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				return;
			}
		} else {
			if (defaultUPath.substring(0, 1).equalsIgnoreCase("/"))
				imageUPath = defaultUPath;
			else {
				scriptValue = executeScript(response, "invalid_path", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
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
		scriptValue = executeScript(response, "invalid_path", "" , useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
		if(scriptValue != null){
			response.getWriter().println(scriptValue);
		}
		return;
	}
	if (!fileRealFolderWriteCheck.canWrite()) {
		scriptValue = executeScript(response, "canWriteErr", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
		if(scriptValue != null){
			response.getWriter().println(scriptValue);
		}
		return;
	}

	if (imagePhysicalPath.length() > 0 && imagePhysicalPath.lastIndexOf(File.separator) != imagePhysicalPath.length() - 1)
		imagePhysicalPath += File.separator;

	String imagePhysicalPathsubFolder = imagePhysicalPath;
	File SaveSubFolder = new File(imagePhysicalPathsubFolder + "upload");
	if(!SaveSubFolder.exists()){
		SaveSubFolder.setExecutable(false, true);
		SaveSubFolder.setReadable(true);
		SaveSubFolder.setWritable(false, true);

		boolean returnRes = SaveSubFolder.mkdir();
		if(returnRes == false && !SaveSubFolder.exists()){
			scriptValue = executeScript(response, "invalid_path", "" , useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
			response.getWriter().println(scriptValue);
			return;
		}
	}
	imagePhysicalPathsubFolder += "upload" + File.separator;
	File DeleteTempFolder = null;

	try{

		String tempFileFolder = "";

		if (uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase(""))
			tempFileFolder = tempFolderCreate(imagePhysicalPath);
		else
			tempFileFolder = imagePhysicalPath;

		//boolean isMultipart = ServletFileUpload.isMultipartContent(request);
		if (isMultipart) {
			String realDir = imagePhysicalPathsubFolder;
			//DiskFileItemFactory factory = new DiskFileItemFactory();
			//factory.setSizeThreshold(2 * 1024 * 1024);
			//ServletFileUpload upload = new ServletFileUpload(factory);
			//upload.setSizeMax(-1);
			//upload.setHeaderEncoding("utf-8");
			//List items = upload.parseRequest(request);
			if(items == null){
				scriptValue = executeScript(response, "", messageText, useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				return;
			}
			//Iterator iter=items.iterator();


			String imageMaxCount = "";
			String imageTitle = "";
			String imageAlt = "";
			String imageWidth = "";
			String imageWidthUnit ="";
			String imageHeight = "";
			String imageHeightUnit = "";

			/*
			* 2013.03.28 [3.0] mwHong
			*
			* imageMarginSet
			*
			*/
			String imageMarginLeft = "";
			String imageMarginLeftUnit ="";
			String imageMarginRight = "";
			String imageMarginRightUnit = "";
			String imageMarginTop = "";
			String imageMarginTopUnit ="";
			String imageMarginBottom = "";
			String imageMarginBottomUnit = "";

			int oriWidthCheck = 0, oriHeightCheck = 0;

			String imageAlign = "";
			String imageId = "";
			String imageClass = "";
			String imageBorder = "";
			String imageKind = "";
			String imageTempFName = "";
			String imageUNameType = "";
			String imageUNameEncode = "";
			String imageViewerPlay = "";
			String imageOrgPath = "";
			String editorFrame = "";
			String filename = "";
			String type = "";

			String imageSize = "";

			//while(iter.hasNext()){
			//	FileItem fileItem = (FileItem) iter.next();
			for(int i=0; items.size()>i; i++){
				FileItem fileItem = (FileItem) items.get(i);
				if(fileItem.isFormField()){
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaxCount") ) imageMaxCount =  detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageTitle") ) imageTitle = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageAlt") ) imageAlt = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageWidth") ) imageWidth = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageWidthUnit") ) imageWidthUnit = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageHeight") ) imageHeight = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageHeightUnit") ) imageHeightUnit = detectXSSEx(toString(fileItem.getString("utf-8")));

						/*
						* 2013.03.28 [3.0] mwHong
						*
						* imageMarginSet
						*
						*/
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginLeft") ) imageMarginLeft = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginLeftUnit") ) imageMarginLeftUnit = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginRight") ) imageMarginRight = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginRightUnit") ) imageMarginRightUnit = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginTop") ) imageMarginTop = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginTopUnit") ) imageMarginTopUnit = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginBottom") ) imageMarginBottom = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageMaginBottomUnit") ) imageMarginBottomUnit = detectXSSEx(toString(fileItem.getString("utf-8")));

						if( fileItem.getFieldName().equalsIgnoreCase("imageAlign") ) imageAlign = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageId") ) imageId = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageClass") ) imageClass = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageBorder") ) imageBorder = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageKind") ) imageKind = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageTempFName") ) imageTempFName = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageUNameType") ) imageUNameType = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageUNameEncode") ) imageUNameEncode = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageViewerPlay") ) imageViewerPlay = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("imageOrgPath") ) imageOrgPath = detectXSSEx(toString(fileItem.getString("utf-8")));
						if( fileItem.getFieldName().equalsIgnoreCase("editorFrame") ) editorFrame = detectXSSEx(toString(fileItem.getString("utf-8")));

				} else {
					if(fileItem.getSize()>0) {
						imageSize = Long.toString(fileItem.getSize());
						if(fileItem.getSize() > maxSize){
							scriptValue = executeScript(response, "invalid_size", Integer.toString(maxSize), useExternalServer, imageDomain, imageEditorFlag, checkPlugin);

							if(scriptValue != null){
								response.getWriter().println(scriptValue);
							}
							return;
						}
						filename = fileItem.getName();

						if (filename != null) {

							filename = detectXSSEx(filename);
							/*
							if (filename.endsWith(".jsp") || filename.endsWith(".js") || filename.endsWith(".html") || filename.endsWith(".htm")) {
							   scriptValue = executeScript(response, "invalid_image", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
							   response.getWriter().println(scriptValue);
							   return;
							}
							*/

							// WhiteList Check...
							String safeExtensions = detectXSSEx((String)pageContext.getAttribute("safeExtensions"));
							String strExt = filename.substring(filename.lastIndexOf(".") + 1);
							System.out.println(safeExtensions + " " + strExt);
							if(strExt == null || strExt.length() == 0 || safeExtensions.indexOf(strExt.toLowerCase()) < 0){
								//scriptValue = executeScript(response, "invalid_image", "prohibited extensions", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
								scriptValue = executeScript(response, "UploadFileExtBlock", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
								if(scriptValue != null){
									response.getWriter().println(scriptValue);
									return;
								}
							}

							// BlackList Check...
							if (filename.toLowerCase().indexOf(".jar") != -1 || filename.toLowerCase().indexOf(".war") != -1 || filename.toLowerCase().indexOf(".jsp") != -1 || filename.toLowerCase().indexOf(".jspx") != -1 || filename.toLowerCase().indexOf(".js") != -1 || filename.toLowerCase().indexOf(".html") != -1 || filename.toLowerCase().indexOf(".htm") != -1) {
							   //scriptValue = executeScript(response, "invalid_image", "prohibited extensions", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
								scriptValue = executeScript(response, "UploadFileExtBlock", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
								if(scriptValue != null){
									response.getWriter().println(scriptValue);
								}
							   return;
							}
						}

						if (filename.lastIndexOf("\\") != -1) {
							filename = filename.substring(filename.lastIndexOf("\\")+1, filename.length());
						}
						
						if(checkPlugin.equalsIgnoreCase("false") && filename.equalsIgnoreCase("blob")) {	
							filename = fileNameTimeSetting()+"."+fileTypeNm;
						}
						
						type = fileItem.getContentType();

						try{
							tempFileName = filename;
							File uploadedFile = new File(realDir + tempFileName);
							if(uploadedFile.exists()){
								tempFileName = fileNameTimeSetting() + filename.substring(filename.lastIndexOf(".")).toLowerCase();
								uploadedFile = new File(realDir + tempFileName);
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
			String imageKindSubFolder = ""; 

			if (imageKind.toLowerCase().indexOf("flash") != -1)
				imageKindSubFolder = "flashes"; 	
			else if (imageKind.toLowerCase().indexOf("image") != -1)
				imageKindSubFolder = "images"; 	
			else
				imageKindSubFolder = "movies"; 
			if (imageUNameType.equalsIgnoreCase("real")) 
				fileTempName = filename.substring(0, filename.lastIndexOf("."));
			else if(imageUNameType.equalsIgnoreCase("random")){
				fileTempName = fileNameTimeSetting();
			}
			else {
				//fileTempName = imageTempFName;
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

			if(uploadFileExtBlockList.length() > 0 && !isArray(uploadFileExtBlockList, fileCheck)){
				scriptValue = executeScript(response, "UploadFileExtBlock", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				response.getWriter().println(scriptValue);
				return;
			}
			
			if (!isImageValid(imageKind, fileCheck)) {
				if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
					boolean returnRes = tempFolderDelete(tempFileFolder);
					if(returnRes == false){
						messageText = "delete fail";
					}
				}

				scriptValue = executeScript(response, "invalid_image", getImageKind(imageKind), useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				return;
			}
			
			/*
			* 2016.03.23 [4.0] hylee
			* image check
			*/	
			
			//2016.11.09 update by nkpark (문제가 있어서 일시적으로 주석처리 추후 다시 살펴봐야함)
			//2018-08-07 [CROSS4-799][롯데백화점] 실제 이미지 파일인지 체크하는 로직
			if("image".equalsIgnoreCase(imageKind) || "backgroundimage".equalsIgnoreCase(imageKind)) {
				
				//Image imgCheck = new ImageIcon(imagePhysicalPathsubFolder + filename).getImage();
				//oriWidthCheck = imgCheck.getWidth(null);
				//oriHeightCheck = imgCheck.getHeight(null);
				Dimension ds = getImageDim(imagePhysicalPathsubFolder + tempFileName);
				
				if (ds == null) {
					if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
						boolean returnRes = tempFolderDelete(tempFileFolder);

						if(returnRes == false){
							messageText = "delete fail";
						}
					}
					scriptValue = executeScript(response, "fail_image", getImageKind(imageKind), useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
					response.getWriter().println(scriptValue);
					return;
				}
				oriWidthCheck = ds.width;
				oriHeightCheck = ds.height;
			} 
			/* end */
			
			if(uploadFileSubDir.equalsIgnoreCase("false")) { 
				if(imageUPath.equalsIgnoreCase("")) {
					File imageSaveSubFolder = new File(imagePhysicalPath + imageKindSubFolder);
					if(!imageSaveSubFolder.exists()){
						imageSaveSubFolder.setExecutable(false, true);
						imageSaveSubFolder.setReadable(true);
						imageSaveSubFolder.setWritable(false, true);

						boolean returnRes = imageSaveSubFolder.mkdir();
						if(returnRes == false){
							scriptValue = executeScript(response, "invalid_path", "" , useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
							response.getWriter().println(scriptValue);
							return;
						}
					}
					imagePhysicalPath += imageKindSubFolder + File.separator;
				}
			} else {
				File imageSaveSubFolder = new File(imagePhysicalPath + imageKindSubFolder);
				if(!imageSaveSubFolder.exists()){
					imageSaveSubFolder.setExecutable(false, true);
					imageSaveSubFolder.setReadable(true);
					imageSaveSubFolder.setWritable(false, true);

					boolean returnRes = imageSaveSubFolder.mkdir();
					if(returnRes == false){
						scriptValue = executeScript(response, "invalid_path", "" , useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
						response.getWriter().println(scriptValue);
						return;
					}
				}
				imagePhysicalPath += imageKindSubFolder + File.separator;

				saveFolder = getChildDirectory(imagePhysicalPath, imageMaxCount); 
				
				if (saveFolder.equalsIgnoreCase("")) {	
					if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
						boolean returnRes = tempFolderDelete(tempFileFolder);

						if(returnRes == false){
							messageText = "delete fail";
						}
					}
					scriptValue = executeScript(response, "invalid_path", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
					if(scriptValue != null){
						response.getWriter().println(scriptValue);
					}
					return;
				} else
					imagePhysicalPath += saveFolder;	
			}
			String filenamecheck = checkFileUniqueName(realFileName, imagePhysicalPath, fileCheck);	

			String imgLinkParams = "";
			String urlFilePathNm = imageUPathHost + imageUPath;

			if(uploadFileSubDir.equalsIgnoreCase("false")) {
				if(imageUPath.equalsIgnoreCase(""))
					urlFilePathNm += imageKindSubFolder + File.separator;
			} else
				urlFilePathNm += imageKindSubFolder + File.separator + saveFolder + File.separator;
			urlFilePathNm = urlFilePathNm.replace('\\', '/');

			if (imageViewerPlay.equalsIgnoreCase("true")) {
				String curUrlPath = request.getRequestURI();


				curUrlPath = curUrlPath.substring(0, curUrlPath.lastIndexOf("/"));
				String imgLinkPathRename = imageUPathHost + curUrlPath + "/ImageViewer.jsp?imagesrc=";
				
				if (imageUNameType.equalsIgnoreCase("real")) {
					String enFileName = filenamecheck.substring(0, filenamecheck.lastIndexOf("."));
					String enFileExt = filenamecheck.substring(filenamecheck.lastIndexOf("."));
					//sun.misc.BASE64Encoder encoder = new sun.misc.BASE64Encoder();
					//byte[] keyByte = enFileName.getBytes("utf-8");
					//라이브러리 추가 요함 -> https://commons.apache.org/proper/commons-codec/download_codec.cgi
					//imgLinkParams = java.net.URLEncoder.encode(urlFilePathNm + encoder.encode(keyByte).replaceAll("/", "==NamOSeSlaSH==") + enFileExt + "|" + imageUNameType);
					byte[] encoded2 = Base64.encodeBase64(enFileName.getBytes());
					enFileName = new String(encoded2, "ISO-8859-1");

					imgLinkParams =  URLEncoder.encode(urlFilePathNm + enFileName.replaceAll("/", "==NamOSeSlaSH==") + enFileExt + "|" + imageUNameType);
					urlFilePathNm = imgLinkPathRename + imgLinkParams;
				} else {
					imgLinkParams =  URLEncoder.encode(urlFilePathNm + filenamecheck + "|" + imageUNameType);
					urlFilePathNm = imgLinkPathRename + imgLinkParams;
				}
			} else {
				urlFilePathNm += filenamecheck;
				imgLinkParams = urlFilePathNm;
			}
			if (imageOrgPath != null && !imageOrgPath.equalsIgnoreCase(""))
				imageOrgPath += "|" + urlFilePathNm;
	
			if (imageTitle == null)
				imageTitle ="";
			if (imageAlt == null)
				imageAlt ="";
			if (imageWidth == null)
				imageWidth ="";
			if (imageWidthUnit == null)
				imageWidthUnit = "";
			if (imageHeight == null)
				imageHeight ="";
			if (imageHeightUnit == null)
				imageHeightUnit = "";
				
			/*
			* 2013.03.28 [3.0] mwHong
			*
			* imageMarginSet
			* 
			*/	
			if (imageMarginLeft == null)
				imageMarginLeft ="";
			if (imageMarginLeftUnit == null)
				imageMarginLeftUnit = "";
			if (imageMarginRight == null)
				imageMarginRight ="";
			if (imageMarginRightUnit == null)
				imageMarginRightUnit = "";
			if (imageMarginTop == null)
				imageMarginTop ="";
			if (imageMarginTopUnit == null)
				imageMarginTopUnit = "";
			if (imageMarginBottom == null)
				imageMarginBottom ="";
			if (imageMarginBottomUnit == null)
				imageMarginBottomUnit = "";
				
				
			if (imageAlign == null)
				imageAlign ="";
			if (imageId == null)
				imageId ="";
			if (imageClass == null)
				imageClass = "";
			if (imageBorder == null)
				imageBorder ="";
			if (imageOrgPath == null)
				imageOrgPath ="";
			if (editorFrame == null)
				editorFrame ="";

			if (imageSize == null)
				imageSize ="";


			returnParam = "{";
			//returnParam += "\"imageURL\":\"" + urlFilePathNm.replaceAll("'", "\\\\\"") + "\",";
			returnParam += "\"imageURL\":\"" + urlFilePathNm + "\",";
			returnParam += "\"imageTitle\":\"" + imageTitle + "\",";
			returnParam += "\"imageAlt\":\"" + imageAlt + "\",";
			returnParam += "\"imageWidth\":\"" + imageWidth + "\",";
			returnParam += "\"imageWidthUnit\":\"" + imageWidthUnit + "\",";
			returnParam += "\"imageHeight\":\"" + imageHeight + "\",";
			returnParam += "\"imageHeightUnit\":\"" + imageHeightUnit + "\",";
			returnParam += "\"imageSize\":\"" + imageSize + "\",";
			
			/*
			* 2013.03.28 [3.0] mwHong
			*
			* imageMarginSet
			*
			*/
			returnParam += "\"imageMarginLeft\":\"" + imageMarginLeft + "\",";
			returnParam += "\"imageMarginLeftUnit\":\"" + imageMarginLeftUnit + "\",";
			returnParam += "\"imageMarginRight\":\"" + imageMarginRight + "\",";
			returnParam += "\"imageMarginRightUnit\":\"" + imageMarginRightUnit + "\",";
			returnParam += "\"imageMarginTop\":\"" + imageMarginTop + "\",";
			returnParam += "\"imageMarginTopUnit\":\"" + imageMarginTopUnit + "\",";
			returnParam += "\"imageMarginBottom\":\"" + imageMarginBottom + "\",";
			returnParam += "\"imageMarginBottomUnit\":\"" + imageMarginBottomUnit + "\",";
			
			returnParam += "\"imageAlign\":\"" + imageAlign + "\",";
			returnParam += "\"imageId\":\"" + imageId + "\",";
			returnParam += "\"imageClass\":\"" + imageClass + "\",";
			returnParam += "\"imageBorder\":\"" + imageBorder + "\",";
			returnParam += "\"imageKind\":\"" + imageKind + "\",";
			returnParam += "\"imageOrgPath\":\"" + imageOrgPath + "\",";
			if(imageKind.equalsIgnoreCase("image")) {
				/*
				int oriWidth = 0;
				int oriHeight = 0;
				try {
					//2012.06.05 [2.0.4.16->2.0.4.17] nkpark heap memory
					Image img = new ImageIcon(imagePhysicalPathsubFolder + tempFileName).getImage();
					oriWidth = img.getWidth(null);
					oriHeight = img.getHeight(null);
				} catch(Exception e) {
					//System.out.println("An internal exception occured!");
					messageText = "get ImageSize fail";
				}
				*/
				returnParam += "\"imageOrgWidth\":\"" + oriWidthCheck + "\",";
				returnParam += "\"imageOrgHeight\":\"" + oriHeightCheck + "\",";
			}
			if (imageModify.equalsIgnoreCase("true"))
				returnParam += "\"imageModify\":\"true\",";
			returnParam += "\"editorFrame\":\"" + editorFrame + "\"";
			returnParam += "}";	
			
			String moveFilePathNm = imagePhysicalPath + File.separator + filenamecheck;
			int check = fileCopy(imagePhysicalPathsubFolder + tempFileName, moveFilePathNm);

			if(DeleteTempFolder != null){
				boolean returnRes = tempFileDelete(DeleteTempFolder);
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
					scriptValue = executeScript(response, "virus", msg, useExternalServer, imageDomain, imageEditorFlag, "false");	
					if(scriptValue != null){
						response.getWriter().println(scriptValue);
					}
					return;
				}
				*/

				if (imageEditorFlag.equalsIgnoreCase("flashPhoto")) {
					scriptValue = "{";
					scriptValue += "\"result\":\"success\",";
					scriptValue += "\"imageURL\":\"" + urlFilePathNm + "\",";
					scriptValue += "\"addmsg\":" + returnParam;
					scriptValue += "}";
				} else{
					scriptValue = executeScript(response, "success", returnParam, useExternalServer, imageDomain, imageEditorFlag, checkPlugin);

					//response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE"); 
					//response.setHeader("Access-Control-Max-Age", "3600"); 
					//response.setHeader("Access-Control-Allow-Headers", "x-requested-with"); 
					response.setHeader("Access-Control-Allow-Origin", "*"); 	
				}
					
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				
				return;
			} else {
				if(uploadFileSubDir.equalsIgnoreCase("false") && !imageUPath.equalsIgnoreCase("")){
					boolean returnRes = tempFolderDelete(tempFileFolder);
					if(returnRes == false){
						messageText = "delete fail";
					}
				}

				scriptValue = executeScript(response, "fileCopyFail", "", useExternalServer, imageDomain, imageEditorFlag, checkPlugin);	
				if(scriptValue != null){
					response.getWriter().println(scriptValue);
				}
				return;			
			}
		}else{
				response.getWriter().println("not encoding type multipart/form-data");
		}
	} catch (IOException ioe) {
		scriptValue = executeScript(response, "invalid_size", Integer.toString(maxSize), useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
		
		if(scriptValue != null){
			response.getWriter().println(scriptValue);
		}
		return;
	} catch (org.apache.commons.fileupload.FileUploadBase.SizeLimitExceededException e) {
		scriptValue = executeScript(response, "invalid_size", Integer.toString(maxSize), useExternalServer, imageDomain, imageEditorFlag, checkPlugin);

        if(scriptValue != null){
			response.getWriter().println(scriptValue);
		}
		return;
    } catch (RuntimeException e) {	
		
		messageText += " RuntimeException";
		messageText = "<System Error>" + messageText;
		
		scriptValue = executeScript(response, "", messageText, useExternalServer, imageDomain, imageEditorFlag, checkPlugin);
		if(scriptValue != null){
			response.getWriter().println(scriptValue);
		}
		return;
	}

%>
