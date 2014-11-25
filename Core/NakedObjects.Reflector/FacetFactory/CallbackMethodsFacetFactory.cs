// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Collections.Generic;
using System.Reflection;
using Common.Logging;
using NakedObjects.Architecture;
using NakedObjects.Architecture.Component;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.FacetFactory;
using NakedObjects.Architecture.Reflect;
using NakedObjects.Architecture.Spec;
using NakedObjects.Meta.Facet;
using NakedObjects.Meta.Utils;

namespace NakedObjects.Reflect.FacetFactory {
    public class CallbackMethodsFacetFactory : MethodPrefixBasedFacetFactoryAbstract {
        private static readonly ILog Log = LogManager.GetLogger(typeof (CallbackMethodsFacetFactory));

        private static readonly string[] FixedPrefixes = {
            PrefixesAndRecognisedMethods.DeletedMethod,
            PrefixesAndRecognisedMethods.DeletingMethod,
            PrefixesAndRecognisedMethods.LoadedMethod,
            PrefixesAndRecognisedMethods.LoadingMethod,
            PrefixesAndRecognisedMethods.UpdatedMethod,
            PrefixesAndRecognisedMethods.UpdatingMethod,
            PrefixesAndRecognisedMethods.PersistedMethod,
            PrefixesAndRecognisedMethods.PersistingMethod,
            PrefixesAndRecognisedMethods.SavedMethod,
            PrefixesAndRecognisedMethods.SavingMethod,
            PrefixesAndRecognisedMethods.CreatedMethod,
            PrefixesAndRecognisedMethods.OnPersistingErrorMethod,
            PrefixesAndRecognisedMethods.OnUpdatingErrorMethod
        };


        public CallbackMethodsFacetFactory(int numericOrder)
            : base(numericOrder, FeatureType.Objects) {}

        public override string[] Prefixes {
            get { return FixedPrefixes; }
        }

        public override void Process(IReflector reflector, Type type, IMethodRemover remover, ISpecificationBuilder specification) {
            var facets = new List<IFacet>();
            var methods = new List<MethodInfo>();

            MethodInfo method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.CreatedMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new CreatedCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new CreatedCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.PersistingMethod, typeof (void), Type.EmptyTypes);
            MethodInfo oldMethod = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.SavingMethod, typeof (void), Type.EmptyTypes);

            if (method != null && oldMethod != null) {
                // cannot have both old and new method types 
                throw new ModelException(Resources.NakedObjects.PersistingSavingError);
            }

            if (method == null && oldMethod != null) {
                Log.WarnFormat("Class {0} still has Saving method - replace with Persisting", type);
                method = oldMethod;
            }

            if (method != null) {
                methods.Add(method);
                facets.Add(new PersistingCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new PersistingCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.PersistedMethod, typeof (void), Type.EmptyTypes);
            oldMethod = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.SavedMethod, typeof (void), Type.EmptyTypes);

            if (method != null && oldMethod != null) {
                // cannot have both old and new method types 
                throw new ModelException("Cannot have both Persisted and Saved methods - please remove Saved");
            }

            if (method == null && oldMethod != null) {
                Log.WarnFormat("Class {0} still has Saved method - replace with Persisted", type.ToString());
                method = oldMethod;
            }

            if (method != null) {
                methods.Add(method);
                facets.Add(new PersistedCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new PersistedCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.UpdatingMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new UpdatingCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new UpdatingCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.UpdatedMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new UpdatedCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new UpdatedCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.LoadingMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new LoadingCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new LoadingCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.LoadedMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new LoadedCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new LoadedCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.DeletingMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new DeletingCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new DeletingCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.DeletedMethod, typeof (void), Type.EmptyTypes);
            if (method != null) {
                methods.Add(method);
                facets.Add(new DeletedCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new DeletedCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.OnUpdatingErrorMethod, typeof (string), new[] {typeof (Exception)});
            if (method != null) {
                methods.Add(method);
                facets.Add(new OnUpdatingErrorCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new OnUpdatingErrorCallbackFacetNull(specification));
            }

            method = FindMethod(reflector, type, MethodType.Object, PrefixesAndRecognisedMethods.OnPersistingErrorMethod, typeof (string), new[] {typeof (Exception)});
            if (method != null) {
                methods.Add(method);
                facets.Add(new OnPersistingErrorCallbackFacetViaMethod(method, specification));
            }
            else {
                facets.Add(new OnPersistingErrorCallbackFacetNull(specification));
            }


            remover.RemoveMethods(methods);
            FacetUtils.AddFacets(facets);
        }
    }
}