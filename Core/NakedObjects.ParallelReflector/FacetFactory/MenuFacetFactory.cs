// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Collections.Immutable;
using System.Reflection;
using NakedObjects.Architecture.Component;
using NakedObjects.Architecture.FacetFactory;
using NakedObjects.Architecture.Reflect;
using NakedObjects.Architecture.Spec;
using NakedObjects.Architecture.SpecImmutable;
using NakedObjects.Meta.Facet;
using NakedObjects.Meta.Utils;

namespace NakedObjects.ParallelReflect.FacetFactory {
    public sealed class MenuFacetFactory : MethodPrefixBasedFacetFactoryAbstract {
        private static readonly string[] FixedPrefixes;

        static MenuFacetFactory() {
            FixedPrefixes = new[] {RecognisedMethodsAndPrefixes.MenuMethod};
        }

        public MenuFacetFactory(int numericOrder)
            : base(numericOrder, FeatureType.ObjectsAndInterfaces) { }

        public override string[] Prefixes {
            get { return FixedPrefixes; }
        }

        public override IImmutableDictionary<string, ITypeSpecBuilder> Process(IReflector reflector, Type type, IMethodRemover methodRemover, ISpecificationBuilder specification, IImmutableDictionary<string, ITypeSpecBuilder> metamodel) {
            MethodInfo method = FindMethod(reflector, type, MethodType.Class, RecognisedMethodsAndPrefixes.MenuMethod, null, null);
            if (method != null) {
                RemoveMethod(methodRemover, method);
                FacetUtils.AddFacet(new MenuFacetViaMethod(method, specification));
            }
            else {
                FacetUtils.AddFacet(new MenuFacetDefault(specification));
            }

            return metamodel;
        }
    }
}