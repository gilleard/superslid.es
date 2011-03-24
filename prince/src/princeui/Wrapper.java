/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package princeui;

/**
 *
 * @author Sam
 */
public class Wrapper {

    private boolean replaceSection;
    private boolean replacePre;
    private boolean convertMath;

    private String princePath;
    private String themePath;
    private String indexPath;
    private String outName;

    public Wrapper() {
        replaceSection = false;
        replacePre = false;
        convertMath = true;

        princePath = "C:\\Program Files\\Prince\\Prince.exe";
        themePath = "";
        indexPath = "";
        outName = "prince";
    }

    public void setOutName(String newON){
        outName = newON;
    }

    public String getOutName(){
        return outName;
    }

    public void setIndexPath(String newTP){
        indexPath = newTP;
    }

    public String getIndexPath(){
        return indexPath;
    }

    public void setThemePath(String newTP){
        themePath = newTP;
    }

    public String getThemePath(){
        return themePath;
    }

    public void setPrincePath(String newPP){
        princePath = newPP;
    }

    public String getPrincePath(){
        return princePath;
    }

    public void setReplaceSection(boolean newRS){
        replaceSection = newRS;
    }

    public void setReplacePre(boolean newRP){
        replacePre = newRP;
    }

    public void setConvertMath(boolean newCM){
        convertMath = newCM;
    }

    public boolean getReplaceSection(){
        return replaceSection;
    }

    public boolean getReplacePre(){
        return replacePre;
    }

    public boolean getConvertMath(){
        return convertMath;
    }

    public void beginMain(){
        PrinceConverter converter = new PrinceConverter(indexPath, themePath, outName, princePath,
                                replacePre, replaceSection,
                                convertMath);
        converter.writeOutHtml();
        converter.princeGenerate();
    }

}
