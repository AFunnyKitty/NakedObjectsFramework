﻿// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Selenium {
    public abstract class ViewModelTestsRoot : AWTest {
        public virtual void CreateVM() {
            GeminiUrl("object?i1=View&o1=___1.CustomerDashboard--20071&as1=open");
            WaitForView(Pane.Single, PaneType.Object, "Sean Campbell - Dashboard");
            //TODO: test for no Edit button?
        }

        public virtual void CreateEditableVM() {
            GeminiUrl("object?i1=View&o1=___1.Person--9169&as1=open");
            Click(GetObjectAction("Create Email"));
            WaitForView(Pane.Single, PaneType.Object, "New email");
            wait.Until(dr => dr.FindElements(By.CssSelector(".property"))[4].Text == "Status:\r\nNew");

            ClearFieldThenType("#to1", "Stef");
            ClearFieldThenType("#from1", "Richard");
            ClearFieldThenType("#subject1", "Test");
            ClearFieldThenType("#message1", "Hello");

            var action = wait.Until(d => d.FindElements(By.CssSelector(".action")).
                Single(we => we.Text == "Send"));
            Click(action);
            wait.Until(dr => dr.FindElement(By.CssSelector(".property:nth-child(5)")).Text == "Status:\r\nSent");
            Assert.AreEqual("To:", WaitForCss(".property:nth-child(1)").Text);
            var title = WaitForCss(".title");
            Assert.AreEqual("Sent email", title.Text);
            GeminiUrl("home");
            WaitForView(Pane.Single, PaneType.Home);
        }

        //Test for #46
        public virtual void EditableVMWithEmptyLeadingKeys()
        {
            GeminiUrl("object?i1=View&o1=___1.Person--9169&as1=open");
            Click(GetObjectAction("Create Email"));
            WaitForView(Pane.Single, PaneType.Object, "New email");
            wait.Until(dr => dr.FindElements(By.CssSelector(".property"))[4].Text == "Status:\r\nNew");

            //leave 3/4 of the optional fields empty
            ClearFieldThenType("#subject1", "Test2");

            var action = wait.Until(d => d.FindElements(By.CssSelector(".action")).
                Single(we => we.Text == "Send"));
            Click(action);
            wait.Until(dr => dr.FindElement(By.CssSelector(".property:nth-child(5)")).Text == "Status:\r\nSent");
            Assert.AreEqual("To:", WaitForCss(".property:nth-child(1)").Text);
            var title = WaitForCss(".title");
            Assert.AreEqual("Sent email", title.Text);
        }

        public virtual void CreateSwitchableVM() {
            GeminiUrl("object?i1=View&o1=___1.StoreSalesInfo--AW00000293--False&as1=open");
            WaitForView(Pane.Single, PaneType.Object, "Sales Info for: Fashionable Bikes and Accessories");
            Click(GetObjectAction("Edit")); //Note: not same as the generic (object) Edit button
            WaitForView(Pane.Single, PaneType.Object, "Editing - Sales Info for: Fashionable Bikes and Accessories");
            SelectDropDownOnField("#salesterritory1", "Central");
            Click(SaveButton()); //TODO: check if this works
            WaitForView(Pane.Single, PaneType.Object, "Sales Info for: Fashionable Bikes and Accessories");
            WaitForTextEquals(".property", 2, "Sales Territory:\r\nCentral");
        }
    }

    public abstract class ViewModelsTests : ViewModelTestsRoot {
        [TestMethod]
        public override void CreateVM() {
            base.CreateVM();
        }

        [TestMethod]
        public override void CreateEditableVM() {
            base.CreateEditableVM();
        }

        [TestMethod]
        public override void EditableVMWithEmptyLeadingKeys()
        {
            base.EditableVMWithEmptyLeadingKeys();
        }

        [TestMethod]
        public override void CreateSwitchableVM() {
            base.CreateSwitchableVM();
        }
    }

    #region browsers specific subclasses

    public class ViewModelTestsIe : ViewModelsTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
            Url(BaseUrl);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    //[TestClass] //Firefox Individual
    public class ViewModelFirefox : ViewModelsTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitFirefoxDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    public class ViewModelTestsChrome : ViewModelsTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitChromeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    #endregion

    #region Mega tests

    public abstract class MegaViewModelTestsRoot : ViewModelTestsRoot {
        [TestMethod] //Mega
        public void MegaViewModelTest() {
            CreateVM();
            CreateEditableVM();
            EditableVMWithEmptyLeadingKeys();
            CreateSwitchableVM();
        }
    }

    //[TestClass]
    public class MegaViewModelTestsFirefox : MegaViewModelTestsRoot {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitFirefoxDriver();
            Url(BaseUrl);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class MegaViewModelTestsIe : MegaViewModelTestsRoot {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
            Url(BaseUrl);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    #endregion
}