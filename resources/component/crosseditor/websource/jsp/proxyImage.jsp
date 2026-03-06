

<%@page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@page import="java.io.IOException"%>
<%@page import="java.io.InputStream"%>
<%@page import="java.io.OutputStream"%>
<%@page import="java.io.OutputStreamWriter"%>
<%@page import="java.io.Writer"%>
<%@page import="java.net.URL"%>
<%@page import="java.net.URLConnection"%>
<%@page import="java.util.regex.Pattern"%>
<%@page import="com.google.common.io.BaseEncoding"%>
<%@page import="com.google.common.io.ByteStreams"%>
<%@page import="com.google.gson.Gson"%>

<%!
	static final long serialVersionUID = -3408677365195660129L;
%>

<%
	Writer output = null;
	Pattern callbackPattern = Pattern.compile("[a-zA-Z_$][0-9a-zA-Z_$]*");
	try {
		URL url = new URL(request.getParameter("url"));
		String callback = request.getParameter("callback");
		
		URLConnection connection = url.openConnection();
		InputStream data = connection.getInputStream();
		String contentType = connection.getContentType();
		int nLength = connection.getContentLength();

		if (callback == null) {
			response.setContentType(contentType.replaceAll("[\\r\\n]", ""));
			response.setContentLength(nLength);
			ByteStreams.copy(data, response.getOutputStream());
		} else {
			//if (!callbackPattern.matcher(callback).matches()) {
				//System.out.println("Invalid callback name");
			//}
			response.setContentType("application/javascript");
			output = new OutputStreamWriter(response.getOutputStream(), "utf-8") {
				public void close() throws IOException {
					//Base64 stream will try to close before jsonp suffix is added.
				};
			};
					
			String dataUri = new Gson().toJson("data:" + contentType + ";base64,");
			output.write(callback + "(" + dataUri.substring(0, dataUri.length()-1));

			OutputStream base64Stream = BaseEncoding.base64().encodingStream(output);
			ByteStreams.copy(data, base64Stream); 
			base64Stream.close();

			output.write("\");");
			output.flush();
		}
	} catch (IOException ioe) {
		//System.out.println("An IOException occurred.");
    } catch (RuntimeException e) {	
    	//System.out.println("An RuntimeException occurred.");
	}finally{
		try{
			if( output != null){
				output.close();
				output = null;
			}
		}catch(java.io.IOException err1){
			//System.out.println("An internal exception occured!!");
		}
	}

%>