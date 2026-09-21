## Adding a new graph child

- [ ] The user input (the written LaTeX) will be parsed to detect the graph child type and it properties and also detect undefined vars and functions
- [ ] When the users type some variable name (such as `a`) and it is not defined an error will show that `a` is not defined and a button will be shown to add it
  - [ ] In this case if the user pressed ENTER the variable will be added
  - [ ] If the user meant to just add this variable (the input has just `a`) the current graph control should convert to a slider
  - [ ] If it is a more complex expression (such as `a + b`) the current graph control should convert to an expression evaluator and a new graph control will be added to define `a`
- [ ] If there is more than one undefined variable there will exist buttons for each one and ENTER will add all of them
- [ ] Other scenarios like adding x-function or xy-function (implicit functions) will will convert the focused child control to the cooresponding
- [ ] Pressing ENTER (when not adding new undefined variables or functions) will insert a new empty controller underneath the focused one and move the focus to it
