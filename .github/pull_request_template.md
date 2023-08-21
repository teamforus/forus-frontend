## Changes description
<!--- Describe shortly changes here if:
       - your solution differs from issue description
       - there are advices from development side for QA or other stakeholders
-->

## Developers checklist
- [ ] *Check that dusk tests are working locally on compatible branch*
- [ ] *Mobile version of changes is developed* - if its a webshop feature, mobile version for this feature is developed
- [ ] *Webshop feature is WCAG compliant* - if its a webshop feature:
  - [ ] buttons and links are accessible by keyboard
  - [ ] alt. texts added to icons, buttons and links
  - [ ] heading are set as headers in HTML with h1/h2/h3
  - [ ] it's visible after zooming in on 200%

## Developer suggestions
Checkmark if PR:
- [ ] *Needs Translations*
- [ ] *Could affect implementations custom css*
- [ ] *Need mobile design help/work*
- [ ] *Design include inconsistent*

## QA checklist
- [ ] Tag @ sashoa if design review needed
- [ ] *No regress in implementations custom css* - changes are not breaking other implementations designes
- [ ] Feature is tested in different screen sizes - desktop, mobile
- [ ] WCAG requirements are met - new feature is accessible by keyboard, there are an alt texts
- [ ] Translations are done
