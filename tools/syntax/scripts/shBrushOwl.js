;(function()
{
	// CommonJS
	typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;
	function Brush()
	{
	
	function process(match, regexInfo)
	{
		var constructor = SyntaxHighlighter.Match,
			code = match[0],
			result = []
			;
		
		if (match.attributes != null) 
		{
			var attributes, subAttributes;
			
			var	regexOne = new XRegExp('\\<*\\s*(?<prefix> [^\\:?]+)\\:(?<subject> [^\\s\\>]+)\\/*\\>*', 'xg');
			var	regexTwo = new XRegExp('(?<name> [^\\=?]+)\\=(?<val> ".*?"|\'.*?\'|\\w+)\\/*\\>*', 'xg');
			
			
			while ((attributes = regexOne.exec(code)) != null) 
			{ 
				if(attributes.prefix != null)
				{
					var str = new String();
					var str2 = new String();
					str = attributes.prefix;
					if((str == "rdf") || (str == "/rdf")) {
						result.push(new constructor(attributes.prefix, match.index + attributes.index + 1, 'color3'));
						str2 = attributes.subject;
						subAttributes = regexTwo.exec(str2); 
						if(subAttributes!=null)
						{
							result.push(new constructor(subAttributes.name, match.index + attributes.index + attributes[0].indexOf(attributes.subject) + subAttributes.index + subAttributes[0].indexOf(subAttributes.name)*2, 'variable'));
							result.push(new constructor(subAttributes.val, match.index + attributes.index + attributes[0].indexOf(attributes.subject) + subAttributes.index + subAttributes[0].indexOf(subAttributes.val), 'string'));
						}
						else
						{
							result.push(new constructor(attributes.subject, match.index + attributes.index + attributes[0].indexOf(attributes.subject), 'variable'));
						}
					}
					else
					{
						if((str == "owl") || (str == "/owl")) {
							result.push(new constructor(attributes.prefix, match.index + attributes.index + 1, 'keywords')); }
						if((str == "rdfs") || (str == "/rdfs")) {
							result.push(new constructor(attributes.prefix, match.index + attributes.index + 1, 'color3')); }
						result.push(new constructor(attributes.subject, match.index + attributes.index + attributes[0].indexOf(attributes.subject), 'functions'));
					} 
				} 
			} 
		}
		

		return result;
	}
	
	this.regexList = [
		{ regex: new XRegExp('(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)', 'gm'),			css: 'color2' },	// <![ ... [ ... ]]>
		{ regex: new XRegExp('(\\&lt;|<)!--\\s*.*?\\s*--(\\&gt;|>)', 'gm'),								css: 'comments' },	// <!-- ... -->
		{ regex: new XRegExp('(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)', 'sg'), func: process }
	];
};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
	Brush.aliases	= ['owl'];
	SyntaxHighlighter.brushes.Owl = Brush;

	// CommonJS
	typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();