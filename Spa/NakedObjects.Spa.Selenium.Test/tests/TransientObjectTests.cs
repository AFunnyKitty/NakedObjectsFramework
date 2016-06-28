﻿// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Selenium {
    public abstract class TransientObjectTestsRoot : AWTest {
        public virtual void CreateAndSaveTransientObject() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            Click(GetObjectAction("Create New Credit Card"));
            SelectDropDownOnField("#cardtype1", "Vista");
            string number = DateTime.Now.Ticks.ToString(); //pseudo-random string
            var obfuscated = number.Substring(number.Length - 4).PadLeft(number.Length, '*');
            ClearFieldThenType("#cardnumber1", number);
            SelectDropDownOnField("#expmonth1", "12");
            SelectDropDownOnField("#expyear1", "2020");
            Click(SaveButton());
            WaitForView(Pane.Single, PaneType.Object, obfuscated);
        }

        public virtual void SaveAndClose() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            Click(GetObjectAction("Create New Credit Card"));
            SelectDropDownOnField("#cardtype1", "Vista");
            string number = DateTime.Now.Ticks.ToString(); //pseudo-random string
            var obfuscated = number.Substring(number.Length - 4).PadLeft(number.Length, '*');
            ClearFieldThenType("#cardnumber1", number);
            SelectDropDownOnField("#expmonth1", "12");
            SelectDropDownOnField("#expyear1", "2020");
            Click(SaveAndCloseButton());
            WaitForView(Pane.Single, PaneType.Object, "Arthur Wilson");
            //But check that credit card was saved nonetheless
            GetObjectAction("Recent Credit Cards").Click();
            WaitForView(Pane.Single, PaneType.List, "Recent Credit Cards");
            wait.Until(dr => dr.FindElements(By.CssSelector(".collection table tbody tr td.reference")).First().Text == obfuscated);
        }

        public virtual void MissingMandatoryFieldsNotified() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            Click(GetObjectAction("Create New Credit Card"));
            SelectDropDownOnField("#cardtype1", "Vista");
            SelectDropDownOnField("#expyear1", "2020");
            SaveButton().AssertIsDisabled().AssertHasTooltip("Missing mandatory fields: Card Number; Exp Month; ");
        }

        public virtual void IndividualFieldValidation() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            Click(GetObjectAction("Create New Credit Card"));
            SelectDropDownOnField("#cardtype1", "Vista");
            ClearFieldThenType("input#cardnumber1", "123");
            SelectDropDownOnField("#expmonth1", "1");
            SelectDropDownOnField("#expyear1", "2020");
            Click(SaveButton());
            wait.Until(dr => dr.FindElements(
                By.CssSelector(".validation")).Any(el => el.Text == "card number too short"));
            WaitForMessage("See field validation message(s).");
        }

        public virtual void MultiFieldValidation() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            Click(GetObjectAction("Create New Credit Card"));
            SelectDropDownOnField("#cardtype1", "Vista");
            ClearFieldThenType("#cardnumber1", "1111222233334444");
            SelectDropDownOnField("#expmonth1", "1");
            SelectDropDownOnField("#expyear1", "2008");
            Click(SaveButton());
            WaitForMessage("Expiry date must be in the future");
        }

        public virtual void PropertyDescriptionAndRequiredRenderedAsPlaceholder() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            Click(GetObjectAction("Create New Credit Card"));
            var name = WaitForCss("input#cardnumber1");
            Assert.AreEqual("* Without spaces", name.GetAttribute("placeholder"));
        }

        public virtual void CancelTransientObject() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            WaitForView(Pane.Single, PaneType.Object, "Arthur Wilson");
            Click(GetObjectAction("Create New Credit Card"));
            Click(GetCancelEditButton());
            WaitForView(Pane.Single, PaneType.Object, "Arthur Wilson");
        }

        public virtual void SwapPanesWithTransients() {
            GeminiUrl("object/object?o1=___1.Product--738&as1=open&o2=___1.Person--20774&as2=open");
            WaitForView(Pane.Left, PaneType.Object, "LL Road Frame - Black, 52");
            WaitForView(Pane.Right, PaneType.Object, "Isabella Richardson");

            OpenSubMenu("Work Orders", Pane.Left);
            Click(GetObjectAction("Create New Work Order", Pane.Left));
            WaitForView(Pane.Left, PaneType.Object, "Editing - Unsaved Work Order");
            ClearFieldThenType("#orderqty1", "4");

            Click(GetObjectAction("Create New Credit Card", Pane.Right));
            WaitForView(Pane.Right, PaneType.Object, "Editing - Unsaved Credit Card");
            ClearFieldThenType("#cardnumber2", "1111222233334444");

            Click(SwapIcon());
            WaitForView(Pane.Left, PaneType.Object, "Editing - Unsaved Credit Card");
            wait.Until(dr => dr.FindElement(By.CssSelector("#cardnumber1")).GetAttribute("value") == "1111222233334444");
            WaitForView(Pane.Right, PaneType.Object, "Editing - Unsaved Work Order");
            wait.Until(dr => dr.FindElement(By.CssSelector("#orderqty2")).GetAttribute("value") == "4");
        }

        public virtual void BackAndForwardOverTransient() {
            GeminiUrl("object?o1=___1.Person--12043&as1=open");
            WaitForView(Pane.Single, PaneType.Object, "Arthur Wilson");
            Click(GetObjectAction("Create New Credit Card"));
            WaitForView(Pane.Single, PaneType.Object, "Editing - Unsaved Credit Card");
            Click(br.FindElement(By.CssSelector(".icon-back")));
            WaitForView(Pane.Single, PaneType.Object, "Arthur Wilson");
            Click(br.FindElement(By.CssSelector(".icon-forward")));
            WaitForView(Pane.Single, PaneType.Object, "Editing - Unsaved Credit Card");
        }

        public virtual void RequestForExpiredTransient() {
            GeminiUrl("object?i1=Transient&o1=___1.CreditCard--100");
            wait.Until(dr => dr.FindElement(By.CssSelector(".title")).Text == "The requested view of unsaved object details has expired.");
        }

        public virtual void ConditionalChoicesOnTransient() {
            GeminiUrl("home?m1=ProductRepository");
            Click(GetObjectAction("New Product"));
            WaitForView(Pane.Single, PaneType.Object, "Editing - Unsaved Product");
            // set product category and sub category
            SelectDropDownOnField("#productcategory1", "Clothing");

            wait.Until(d => d.FindElements(By.CssSelector("select#productsubcategory1 option")).Any(el => el.Text == "Bib-Shorts"));

            SelectDropDownOnField("#productsubcategory1", "Bib-Shorts");

            SelectDropDownOnField("#productcategory1", "Bikes");

            wait.Until(d => d.FindElements(By.CssSelector("select#productsubcategory1 option")).Count == 4);

            SelectDropDownOnField("#productsubcategory1", "Mountain Bikes");
        }

        public virtual void TransientWithHiddenNonOptionalFields() {
            GeminiUrl("object?i1=View&o1=___1.Product--380&as1=open");
            WaitForView(Pane.Single, PaneType.Object, "Hex Nut 8");
            Click(GetObjectAction("Create New Work Order", Pane.Single, "Work Orders"));
            WaitForView(Pane.Single, PaneType.Object, "Editing - Unsaved Work Order");
            ClearFieldThenType("#orderqty1", "1");
            SaveObject();
        }

        //Test for a previous bug  -  where Etag error was resulting
        public virtual void CanInvokeActionOnASavedTransient() {
            GeminiUrl("object?i1=View&o1=___1.Customer--11784&as1=open&d1=CreateNewOrder&f1_copyHeaderFromLastOrder=true");
            Click(OKButton());
            WaitForView(Pane.Single, PaneType.Object, "Editing - Unsaved Sales Order");
            Click(SaveButton());
            OpenObjectActions();
            OpenActionDialog("Add New Sales Reason");
            SelectDropDownOnField("#reason1", 1);
            Click(OKButton());
            wait.Until(d => br.FindElements(By.CssSelector(".collection"))[1].Text == "Reasons:\r\n1 Item");
        }
    }

    public abstract class TransientObjectTests : TransientObjectTestsRoot {
        [TestMethod]
        public override void CreateAndSaveTransientObject() {
            base.CreateAndSaveTransientObject();
        }

        [TestMethod]
        public override void SaveAndClose() {
            base.SaveAndClose();
        }

        [TestMethod]
        public override void MissingMandatoryFieldsNotified() {
            base.MissingMandatoryFieldsNotified();
        }

        [TestMethod]
        public override void IndividualFieldValidation() {
            base.IndividualFieldValidation();
        }

        [TestMethod]
        public override void MultiFieldValidation() {
            base.MultiFieldValidation();
        }

        [TestMethod]
        public override void PropertyDescriptionAndRequiredRenderedAsPlaceholder() {
            base.PropertyDescriptionAndRequiredRenderedAsPlaceholder();
        }

        [TestMethod]
        public override void CancelTransientObject() {
            base.CancelTransientObject();
        }

        [TestMethod]
        public override void SwapPanesWithTransients() {
            base.SwapPanesWithTransients();
        }

        [TestMethod]
        public override void BackAndForwardOverTransient() {
            base.BackAndForwardOverTransient();
        }

        [TestMethod]
        public override void RequestForExpiredTransient() {
            base.RequestForExpiredTransient();
        }

        [TestMethod]
        public override void ConditionalChoicesOnTransient() {
            base.ConditionalChoicesOnTransient();
        }

        [TestMethod]
        public override void TransientWithHiddenNonOptionalFields() {
            base.TransientWithHiddenNonOptionalFields();
        }

        [TestMethod]
        public override void CanInvokeActionOnASavedTransient() {
            base.CanInvokeActionOnASavedTransient();
        }
    }

    #region browsers specific subclasses

    public class TransientObjectTestsIe : TransientObjectTests {
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
    public class TransientObjectTestsFirefox : TransientObjectTests {
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

    public class TransientObjectTestsChrome : TransientObjectTests {
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

    public abstract class MegaTransientObjectTestsRoot : TransientObjectTestsRoot {
        [TestMethod] //Mega
        public void MegaTestTransientObjectTests() {
            CreateAndSaveTransientObject();
            SaveAndClose();
            MissingMandatoryFieldsNotified();
            IndividualFieldValidation();
            MultiFieldValidation();
            PropertyDescriptionAndRequiredRenderedAsPlaceholder();
            CancelTransientObject();
            SwapPanesWithTransients();
            BackAndForwardOverTransient();
            RequestForExpiredTransient();
            ConditionalChoicesOnTransient();
            TransientWithHiddenNonOptionalFields();
            CanInvokeActionOnASavedTransient();
        }
    }

    //[TestClass]
    public class MegaTransientObjectTestsFirefox : MegaTransientObjectTestsRoot {
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
    public class MegaTransientObjectTestsIe : MegaTransientObjectTestsRoot {
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