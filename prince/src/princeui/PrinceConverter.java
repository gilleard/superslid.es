/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package princeui;

import org.htmlparser.*;
import org.htmlparser.util.*;
import org.htmlparser.nodes.*;
import org.htmlparser.visitors.*;
import org.htmlparser.tags.*;
import org.htmlparser.filters.*;
import java.io.*;
import java.util.*;
import java.nio.channels.FileChannel;
import com.princexml.Prince;
import uk.ac.ed.ph.snuggletex.*;
import java.util.regex.*;

/**
 *
 * @author Sam
 */
public class PrinceConverter {

        private static Parser parser = null;
	private static boolean insidePre = false;
        private static boolean inFooter = false;
	private static String globalString = null;
	private static StringBuffer html = null;
	private static NodeList theme = null;
        private static String IndexLoc = null;
        private static String outName = null;
        private static String themeLoc = null;
        private static String Directory = null;
        private static String princeLoc = null;
        private static boolean replacePre = false;
        private static boolean replaceSection = false;
        private static boolean includeMath = false;

        public PrinceConverter(String newLoc, String newTheme, String newOutName,String newPrinceLoc,
                                boolean newReplacePre, boolean newReplaceSection,
                                boolean newIncludeMath){
            IndexLoc = newLoc;
            themeLoc = newTheme;
            outName = newOutName;
            princeLoc = newPrinceLoc;
            replacePre = newReplacePre;
            replaceSection = newReplaceSection;
            includeMath = newIncludeMath;
            html = new StringBuffer (4096);
            try {
                parser = new Parser (IndexLoc);
            }
            catch(ParserException e){
                System.err.println("Parsing Failure");
            }
            String [] tempArr;
            tempArr = IndexLoc.split("\\\\slides\\\\");
            Directory = tempArr[0];

            //Refines the html DOM for use in prince.
            stripIllegalTags();

		//Writes out the html to a special prince file.
                //Done in WRAPPER
		//writeOutHtml();

		//Generate the prince file.
                //Done in WRAPPER
		//princeGenerate(loc, dir);
        }

	public static void stripIllegalTags()
	{
		try {
			for (NodeIterator e = parser.elements(); e.hasMoreNodes(); )
				processMyNodes(e.nextNode());

		}
		catch(ParserException e){

		}
	}

        private static void processTextNode(Node node) {
            // downcast to TextNode
            TextNode txtN = (TextNode)node;
            // do whatever processing you want with the text
            String nodeHtml = txtN.toHtml();

            //String to store mathML
            String tempMath;

            //Pattern to find latex maths
            Pattern latex = Pattern.compile("\\\\(.+\\\\).");
            Matcher text = latex.matcher(nodeHtml);
            StringBuffer sb = new StringBuffer();

            if(includeMath) {
                //Find all matches and modify to mathML and replace.
                boolean result = text.find();

                while(result) {
                    tempMath = echoSnuggle(text.group());
                    tempMath = Matcher.quoteReplacement(tempMath);
                    text.appendReplacement(sb, tempMath);
                    result = text.find();
                 }

                 text.appendTail(sb);
           }
				//System.out.println(sb.toString());
           nodeHtml = sb.toString();

           if(!(inFooter)) {
                html.append(nodeHtml);
           }
        }

	public static void processMyNodes (Node node)
	{
	try {
		boolean HTML5tag = false;
		boolean unwantedTag = false;
		boolean subPre = false;

		String nodeHtml = "";

			if (node instanceof TextNode)
			{
                            processTextNode(node);
			}
			if (node instanceof RemarkNode)
			{
				// downcast to RemarkNode
				RemarkNode remark = (RemarkNode)node;
				// do whatever processing you want with the comment
				nodeHtml = remark.toHtml();
			}
			else if (node instanceof TagNode)
			{
				// downcast to TagNode
				TagNode tag = (TagNode)node;

                                //set the class of the body to slides (So the theme can recognise it
				if(tag.getRawTagName().equals("body")){
					tag.setAttribute("class", "\"slides\"");
				}

				// locate the theme
				if(tag.getAttribute("id") != null) {
					if(tag.getAttribute("id").equals("theme"))
						theme = tag.getChildren();
				}

				// add theme to slides
				if(tag.getAttribute("id") != null) {
                                    //if the current slide is the slides wrapper
                                    if((tag.getAttribute("id").equals("slides")) && (tag.getChildren() != null)) {
                                        //get all the individual slides
					NodeList slides = tag.getChildren();

					//For each slide
					for(int i = 0;i < slides.size();i++)
					{
						//If the theme exists
						if(theme != null){

							//If the slide is as expected (type TagNode)
							if(slides.elementAt(i) instanceof TagNode) {

                                                            //Cast to TagNode
                                                            TagNode current = (TagNode)slides.elementAt(i);

                                                            //Prepend the theme to the children
                                                            if(current.getRawTagName().equals("div")) {
                                                                NodeList children = current.getChildren();
								for(int x = 0;x < theme.size();x++) {
                                                                    children.prepend(theme.elementAt(x));
								}
								current.setChildren(children);
                                                            }
                                                        }
                                                }
					}
                                    }
                                }
				


				//Mark unwanted tags
				if(tag.getRawTagName().equals("link")||tag.getRawTagName().equals("script")
                                        ||tag.getRawTagName().equals("!doctype") ||tag.getRawTagName().equals("!DOCTYPE")) {
					unwantedTag=true;
				}

                                boolean supported = checkSupport(tag);


				//Replace all < and > tags with HTML versions in PRE
				if(insidePre) {
					nodeHtml = tag.toHtml();
					nodeHtml = nodeHtml.replace("<","&lt;");
					nodeHtml = nodeHtml.replace(">","&gt;");
				}


				/*DEAL WITH PRE TAGS AND CONTENTS*/
				if(tag.getRawTagName().equals("pre")){
					HTML5tag=true;
					if(insidePre) {
                                              subPre = true;
					}
					insidePre=true;
					if(!(subPre)) {
                                              nodeHtml = "<"+tag.getText()+">";
					}
				}

				if(tag.getRawTagName().equals("/pre")){
					HTML5tag=true;
					if(!(subPre)) {
                                            insidePre = false;
					}
				}
				/* -------------------------------- */

				/*DEAL WITH SECTION TAGS*/
                               
                                    if(tag.getRawTagName().equals("section")){
					HTML5tag=true;
                                        if(replaceSection) {
                                            tag.setTagName("div");
                                            tag.setAttribute("class", "\"section\"");
                                        }
                                    }
                                    if(tag.getRawTagName().equals("/section")){
					HTML5tag=true;
                                        if(replaceSection) {
                                            tag.setTagName("/div");
                                        }
                                    }
				/* -------------------------------- */

				/*DEAL WITH FOOTER TAGS*/
				if(tag.getRawTagName().equals("footer")){
                                        inFooter = true;
					HTML5tag=true;
					tag.setTagName("div");
					tag.setAttribute("class", "\"footer\"");
				}
				if(tag.getRawTagName().equals("/footer")){
                                        inFooter = false;
					HTML5tag=true;
					tag.setTagName("/div");
				}
				/* -------------------------------- */

				//If you arent inside a preTag deal with associated HTML
				if(!insidePre)
				{
					if(!(subPre)) {
						nodeHtml = "<"+tag.getText()+">";
					}
				}

				//If the tag is unwanted the don't write it
				if(!unwantedTag) {

					//write the data to the StringBuffer
					html.append(nodeHtml);


					// process recursively (nodes within nodes) via getChildren()
					NodeList nl = tag.getChildren ();
					if (null != nl)
						for (NodeIterator i = nl.elements (); i.hasMoreNodes(); )
							processMyNodes(i.nextNode ());

					//If it is a recognised tag then construct a closing tag placed after children.
					if((HTML5tag == false)&&(insidePre==false))
					{
                                                if(supported){
                                                    nodeHtml = "</"+tag.getRawTagName()+">";
                                                    html.append(nodeHtml);
                                                }
					}
				}

			}

		}
		catch(ParserException e){

		}
	}

        private static boolean checkSupport(TagNode tag){
            boolean supported = true;
            String[] unsupported = { "em" , "iframe" , "b", "br", "small", "meta", "script", "img"};

            for(int i = 0; i < unsupported.length; i++){
                if(tag.getRawTagName().equals(unsupported[i]) || tag.getRawTagName().equals("/"+unsupported[i])){
                    supported = false;
                }
            }
            return supported;

        }

	//Converts LaTeX into MATHML (Code Taken From http://www2.ph.ed.ac.uk/snuggletex/documentation/web-page-example.html and modified)
	public static String echoSnuggle(String parse) {
	  String math = null;
	  try {
		/* Create vanilla SnuggleEngine and new SnuggleSession */
		SnuggleEngine engine = new SnuggleEngine();
		SnuggleSession session = engine.createSession();

		/* Parse some LaTeX input */
		SnuggleInput input = new SnuggleInput(parse);
		session.parseInput(input);

		/* Specify how we want the resulting XML */
		XMLStringOutputOptions options = new XMLStringOutputOptions();
		options.setSerializationMethod(SerializationMethod.XHTML);
		options.setIndenting(true);
		options.setEncoding("UTF-8");
		options.setAddingMathSourceAnnotations(true);

		math = session.buildXMLString(options);
	  }
	  catch(IOException e) {
		System.err.println("SnuggleTex ERROR");
	  }

	  return math;
	}

	public static void writeOutHtml() {
		try {
			//Open the file
			File princeDoc = new File(Directory+"\\prince\\prince.html");

			//overwrite the contents
			overwrite(princeDoc, html.toString());

		} catch (FileNotFoundException e) {
			System.out.println("Please create a file called 'prince.html' in the superslides prince directory'");
		} catch (IOException e) {
			System.err.println("IO ERROR");
		}
	}


	//Writes the modified HTML file out
	static public void overwrite(File princeFile, String htmlToIns)
                                 throws FileNotFoundException, IOException {
		if (princeFile == null) {
			throw new IllegalArgumentException("File should not be null.");
		}
		if (princeFile.exists() == false) {
			throw new FileNotFoundException ("File does not exist: " + princeFile);
		}

		//create writer
		Writer output = new BufferedWriter(new FileWriter(princeFile));

		try {
			output.write(htmlToIns); //write
		}
		finally {
			output.close(); //close
		}
	}

	public static void princeGenerate()
	{
		
		try {
                        //create and instance of Prince
                        Prince princeXml = new Prince(princeLoc);
			//add the correct style sheets
			princeXml.addStyleSheet(Directory+"\\css\\reset.css");
			princeXml.addStyleSheet(Directory+"\\css\\style.css");
			princeXml.addStyleSheet(themeLoc);
			princeXml.addStyleSheet(Directory+"\\theme\\prince\\theme.css");
                        princeXml.setHTML(true);
			//tries to convert and reports the results
			princeXml.convert(Directory+"\\prince\\prince.html", Directory+"\\prince\\"+outName+".pdf");
		} catch(IOException e) {
			System.err.println("Error in IO");
		}
	}
}
