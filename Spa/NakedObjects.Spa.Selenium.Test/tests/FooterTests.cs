﻿// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Selenium {
    public abstract class FooterTestsRoot : AWTest {
        #region WarningsAndInfo
        public virtual void ExplicitWarningsAndInfo()
        {
            GeminiUrl("home?m1=WorkOrderRepository");
            Click(GetObjectAction("Generate Info And Warning"));
            var warn = WaitForCss(".footer .warnings");
            Assert.AreEqual("Warn User of something else", warn.Text);
            var msg = WaitForCss(".footer .messages");
            Assert.AreEqual("Inform User of something", msg.Text);

            //Test that both are cleared by next action
            Click(GetObjectAction("Random Work Order"));
            WaitUntilElementDoesNotExist(".footer .warnings");
            WaitUntilElementDoesNotExist(".footer .messages");
        }

        public virtual void ZeroParamActionReturningNullGeneratesGenericWarning()
        {
            GeminiUrl("home?m1=EmployeeRepository");
            Click(GetObjectAction("Me"));
            WaitForTextEquals(".footer .warnings", "no result found");
            Click(GetObjectAction("My Departmental Colleagues"));
            WaitForTextEquals(".footer .warnings", "Current user unknown");
        }
        #endregion
        public virtual void Home() {
            GeminiUrl("object?o1=___1.Product--968");
            WaitForView(Pane.Single, PaneType.Object, "Touring-1000 Blue, 54");
            Click(br.FindElement(By.CssSelector(".icon-home")));
            WaitForView(Pane.Single, PaneType.Home, "Home");
        }
        public virtual void BackAndForward() {
            Url(BaseUrl);
            GoToMenuFromHomePage("Orders");
            Click(GetObjectAction("Random Order"));
            WaitForView(Pane.Single, PaneType.Object);
            var orderTitle = WaitForCss(".title").Text;
            ClickBackButton();
            WaitForView(Pane.Single, PaneType.Home);
            ClickForwardButton();
            WaitForView(Pane.Single, PaneType.Object, orderTitle);
            EditObject();
            WaitForView(Pane.Single, PaneType.Object, "Editing - " + orderTitle);
            ClickBackButton();
            WaitForView(Pane.Single, PaneType.Home);
            ClickForwardButton();
            WaitForView(Pane.Single, PaneType.Object, "Editing - " + orderTitle);
            Click(GetCancelEditButton());
            WaitForView(Pane.Single, PaneType.Object, orderTitle);
            ClickBackButton();
            WaitForView(Pane.Single, PaneType.Home);
            ClickForwardButton();
            WaitForView(Pane.Single, PaneType.Object, orderTitle);

            var link = GetReferenceFromProperty("Customer");
            var cusTitle = link.Text;
            Click(link);
            WaitForView(Pane.Single, PaneType.Object, cusTitle);
            ClickBackButton();
            WaitForView(Pane.Single, PaneType.Object, orderTitle);
            ClickForwardButton();
            WaitForView(Pane.Single, PaneType.Object, cusTitle);
            OpenObjectActions();
            OpenSubMenu("Orders");
            OpenActionDialog("Create New Order");
            ClickBackButton();
            WaitForView(Pane.Single, PaneType.Object, cusTitle);
            ClickBackButton();
            WaitForView(Pane.Single, PaneType.Object, orderTitle);
        }
        public virtual void RecentObjects() {
            GeminiUrl("home?m1=CustomerRepository&d1=FindCustomerByAccountNumber&f1_accountNumber=%22AW%22");
            ClearFieldThenType("#accountnumber1", "AW00000042");
            Click(OKButton());
            WaitForView(Pane.Single, PaneType.Object, "Healthy Activity Store, AW00000042");
            GeminiUrl("home?m1=CustomerRepository&d1=FindCustomerByAccountNumber&f1_accountNumber=%22AW%22");
            ClearFieldThenType("#accountnumber1", "AW00000359");
            Click(OKButton());
            WaitForView(Pane.Single, PaneType.Object, "Mechanical Sports Center, AW00000359");
            GeminiUrl("home?m1=CustomerRepository&d1=FindCustomerByAccountNumber&f1_accountNumber=%22AW%22");
            ClearFieldThenType("#accountnumber1", "AW00022262");
            Click(OKButton());
            WaitForView(Pane.Single, PaneType.Object, "Marcus Collins, AW00022262");
            GeminiUrl("home?m1=CustomerRepository&d1=FindCustomerByAccountNumber&f1_accountNumber=%22AW%22");
            GoToMenuFromHomePage("Products");
            Click(GetObjectAction("Find Product By Number"));
            ClearFieldThenType("#number1", "LJ-0192-S");
            Click(OKButton());
            WaitForView(Pane.Single, PaneType.Object, "Long-Sleeve Logo Jersey, S");
            ClickRecentButton();
            WaitForView(Pane.Single, PaneType.Recent);
            var el = WaitForCssNo("tr td:nth-child(1)", 0);
            Assert.AreEqual("Long-Sleeve Logo Jersey, S", el.Text);
            el = WaitForCssNo("tr td:nth-child(1)", 1);
            Assert.AreEqual("Marcus Collins, AW00022262", el.Text);
            el = WaitForCssNo("tr td:nth-child(1)", 2);
            Assert.AreEqual("Mechanical Sports Center, AW00000359", el.Text);
            el = WaitForCssNo("tr td:nth-child(1)", 3);
            Assert.AreEqual("Healthy Activity Store, AW00000042", el.Text);
        }
        public virtual void ApplicationProperties() {
            GeminiUrl("home");
            WaitForView(Pane.Single, PaneType.Home);
            ClickPropertiesButton();
            WaitForView(Pane.Single, PaneType.Properties, "Application Properties");
            wait.Until(d => br.FindElements(By.CssSelector(".property")).Count >= 4);
            ReadOnlyCollection<IWebElement> properties = br.FindElements(By.CssSelector(".property"));
            Assert.IsTrue(properties[0].Text.StartsWith("User Name:"));
            Assert.IsTrue(properties[1].Text.StartsWith("Server Url: http:"));
            Assert.IsTrue(properties[2].Text.StartsWith("Server version: 8.0.0"));
            Assert.IsTrue(properties[3].Text.StartsWith("Client version: 8.0.0"));
        }
        public virtual void LogOff() {
            GeminiUrl("home");
            ClickLogOffButton();
            IAlert alert = br.SwitchTo().Alert();
            Assert.IsTrue(alert.Text.StartsWith("Please confirm logoff of user:"));
            alert.Dismiss();
        }
    }

    public abstract class FooterTests : FooterTestsRoot {

        #region Warnings and Info
        [TestMethod]
        public override void ExplicitWarningsAndInfo()
        {
            base.ExplicitWarningsAndInfo();
        }
        [TestMethod]
        public override void ZeroParamActionReturningNullGeneratesGenericWarning()
        {
            base.ZeroParamActionReturningNullGeneratesGenericWarning();
        }
        #endregion
        [TestMethod]
        public override void Home() {
            base.Home();
        }

        [TestMethod]
        public override void BackAndForward() {
            base.BackAndForward();
        }

        [TestMethod]
        public override void RecentObjects() {
            base.RecentObjects();
        }

        [TestMethod]
        public override void ApplicationProperties() {
            base.ApplicationProperties();
        }

        [TestMethod]
        public override void LogOff() {
            base.LogOff();
        }
    }

    #region browsers specific subclasses 

    public class FooterIconTestsIe : FooterTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    //[TestClass] //Firefox Individual
    public class FooterIconTestsFirefox : FooterTests {
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
    }

    public class FooterIconTestsChrome : FooterTests {
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

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo(0, {0})", element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    #endregion

    #region Mega tests

    public abstract class MegaFooterTestsRoot : FooterTestsRoot {
        [TestMethod] //Mega
        public void MegaFooterTest() {
            ExplicitWarningsAndInfo();
            ZeroParamActionReturningNullGeneratesGenericWarning();
            Home();
            //BackAndForward();
            //RecentObjects();
            //ApplicationProperties();
            LogOff();
        }
    }

    //[TestClass]
    public class MegaFooterTestsFirefox : MegaFooterTestsRoot {
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
    public class MegaFooterTestsIe : MegaFooterTestsRoot {
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

    //[TestClass]
    public class MegaFooterTestsChrome : MegaFooterTestsRoot {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            AWTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitChromeDriver();
            Url(BaseUrl);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }


    #endregion
}