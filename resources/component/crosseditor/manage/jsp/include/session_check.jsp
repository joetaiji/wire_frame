<%
if(session.getAttribute("memId") == null){response.sendRedirect("../admin_index.html");return;}
if(request.getHeader("referer") == null){response.sendRedirect("../admin_index.html");return;}
if(request.getHeader("referer").length() > 0){
	String referer = request.getHeader("referer");
	String requestURL = request.getRequestURL().toString();

	referer = referer.replaceAll("http://","");
	referer = referer.replaceAll("https://","");
	referer = referer.substring(0, referer.indexOf("/"));

	requestURL = requestURL.replaceAll("http://","");
	requestURL = requestURL.replaceAll("https://","");
	requestURL = requestURL.substring(0, requestURL.indexOf("/"));
	//System.out.println("new referer: " + referer);
	//System.out.println("new requestURL: " + requestURL);

	if(!referer.equalsIgnoreCase(requestURL)){
		response.sendRedirect("../admin_index.html");
		return;
	}
}

%>