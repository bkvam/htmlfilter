# htmlfilter -- Character Sheet and Statblock Exporter for Foundry

This is intended primarily for exporting all the details of DnD5e characters to record them for posterity or check them for accuracy. The character sheet in Foundry has so many sections that it can be daunting to check each item.

*Note:* you must be accessing Foundry with a browser that allows you create tabs. The Foundry VTT app itself does not allow this, so you'll need to access the world from a separate browser.

**How It Works:** A tab is created in the browser and the text of the character's abilities, skills, features, etc., are written to it in HTML format based on the filter you have selected in the settings. You can switch to the tab and use the browser's print functionality to print the text to a printer or save to a PDF file. See below for saving the HTML directly to a file.

There are three ways to export characters:

- Right-click a character in the Actors tab of the right sidebar and select the Export Statblock item from the popup menu.
- Select one or more tokens on the canvas (click and drag with the selection rectangle), then click the Export Statblock button at the bottom of the Actors tab in the right sidebar. The character are displayed in alphabetical order by name.
- Open the character sheet and click the HTML Filter icon in the title bar.

The following configuration settings are available:

## Filter file

The name of the filter file. The default is modules/htmlfilter/filters/dnd5e.txt. Currently only two are available, for DnD5e. 

These filters are HTML files with .txt extensions. If you add your own filters you should create them in a different folder so that they will not be lost when you update this module. Creating a filter is like writing an HTML file with special references to the data (see below).

## Show Long Descriptions

Show the long descriptions for items. If unchecked, only the brief details of the item are shown. The exact details shown vary by type of item (equipment, weapons, class, etc.). Items that are equipped are indicated by a preceding bullet.

Note that the details for some items (classes, races) can be quite lengthy, so you may wish to omit all that boilerpalte.

## Full Spell Book

Show the full details all spells. If unchecked, only the names of the spells are displayed at each level. Prepared spells are indicated by a preceding bullet.

## Items to Ignore

A semicolon-delimited list of items that will be ignored in item lists. The default value is "Age;Languages". These appear in all DnD5e character sheets but don't have any information associated with them (the actual languages are indicated elsewhere), so they are just a waste of space.

## Image Height

Height in pixels of the character image, if there is one. To omit the image, enter 0.

# Saving the HTML to a File

Because a newly created tab has no file associated with it, you can't directly save the HTML generated for the stat block to file. This is a limitation of the "about:blank" tab that is used to create the stat block. You can, however, use the debugging features of the browser to copy the HTML and put it in a file.
- Right-click the first line (the character's name) of the stat block.
- In Chrome or Firefox, select the Inspect command from the context menu. The debugger pane of the browser will open.
- Right-click the <html> tag at the top of the debugger pane.
- Select the Copy > Copy Element command in Chrome, or the Copy > Outer HTML in Firefox. Other browsers will have similar commands.
- Press F12 to close the browser debugger pane.
- Switch to an editor that can accept plain text, such as Notepad or Notepad++.
- Paste the text.
- Save the file with a .html extension.
- The file can now be opened with a browser or HTML editor.
- Note that the character image will not be copied this way: it is a reference to a location in the Foundry Data hierarchy and you'll need to copy that separately.

# Creating a Filter
  
A filter file is formatted as standard HTML, with a .txt extension.
  
Some of the data in the character sheet is available through short names, while more obscure data can be referenced through the data structures of the actual actor objects.
  
For example, you can reference the character's name inside header tags with:
  
```html
<h1>@{name}</h1>
```

To reference the character's Strength and Strength modifier you would use:

```html
<td align="center">@{str}<br>(@{sign(strMod)})</td>
```

The sign function places a '+' before numbers greater than zero.

To reference the biography you would use an object reference to the properties of the actor object:

```html
<p class='biography'>@{system.details.biography.value}</p>
```

The following directives are available for programmatically accessing character sheet data:

##@@if{...}

If the expression inside the {...} evaluates to true (non-zero, or a non-empty string) all the text between the @if and the corresponding @@endif is processed and displayed. For example:

```html
@@if{actorType != 'character'}
<p class="exdent"><b>Challenge</b> @{system.details.cr} (@{system.details.xp.value} XP)</p>
@@endif
```

##@@foreach{<type>}

Iterates through the items of the specified type. Names of items are referenced with @{itemname}, and their stats are referenced with @{itemstats}. The extended details are referenced with @{itemdetails}. For example:

```html
@@if{count('weapon')>0}
 <h2>Attacks</h2>
 @@foreach{weapon}
  <p class="exdent"><b>@{itemname}</b>. @{itemstats}</p>
  @@if{showDetails}
   <p class="desc">@{itemdetails}</p>
  @@endif
 @@endforeach
@@endif
```
The count() function returns the count of items of the specified type. Types in a DnD5e character sheet include weapon, class, subclass, feat, equipment, consumable, loot, tool, spell, etc. Other game system may have other types.

##@@for{...}

Similar to a Javascript or C++ for loop. Inside the {...} are the initializer, control expression and increment, separated by semicolons. The initializer sets the control variable. The control expression is evaluated, and if it is true, the text between the @@for and the @@endfor is processed. After the text is processed the increment is evaluated, updating the control variable. Beware of infinite loops!

```html
@@for{slot=1; slot < 10; slot = slot + 1}
	@@define{nslots = *('system.spells.spell' + slot + '.max')}
	@@if{nslots > 0}
		...
	@@endif
@@endfor
```

##@define{...}

